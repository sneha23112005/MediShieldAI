const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const pool = require("../db");

const router = express.Router();


// ===============================
// DOCTOR REGISTRATION
// ===============================

router.post("/register", async (req, res) => {

    try {

        const {
            name,
            specialization,
            phone,
            email,
            password
        } = req.body;


        const existing =
            await pool.query(
                "SELECT * FROM doctors WHERE email = $1",
                [email]
            );


        if (existing.rows.length > 0) {

            return res.status(400).json({
                message: "Doctor already exists"
            });

        }


        const last =
            await pool.query(`
                SELECT doctor_id
                FROM doctors
                ORDER BY doctor_id DESC
                LIMIT 1
            `);


        let number = 1;


        if (last.rows.length > 0) {

            number =
                parseInt(
                    last.rows[0].doctor_id.substring(3)
                ) + 1;

        }


        const doctorId =
            "DOC" + String(number).padStart(3, "0");


        const hashedPassword =
            await bcrypt.hash(password, 10);


        await pool.query(
            `
            INSERT INTO doctors
            (
                doctor_id,
                name,
                specialization,
                phone,
                email,
                password
            )
            VALUES ($1,$2,$3,$4,$5,$6)
            `,
            [
                doctorId,
                name,
                specialization,
                phone,
                email,
                hashedPassword
            ]
        );


        res.status(201).json({

            message: "Doctor registered successfully",

            doctorId

        });


    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server error"
        });

    }

});


// ===============================
// DOCTOR LOGIN
// ===============================

router.post("/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        const result =
            await pool.query(
                "SELECT * FROM doctors WHERE email = $1",
                [email]
            );


        if (result.rows.length === 0) {

            return res.status(404).json({
                message: "Doctor not found"
            });

        }


        const doctor = result.rows[0];


        const valid =
            await bcrypt.compare(
                password,
                doctor.password
            );


        if (!valid) {

            return res.status(401).json({
                message: "Incorrect password"
            });

        }


        const token =
            jwt.sign(
                {
                    doctorId: doctor.doctor_id,
                    role: "doctor"
                },

                process.env.JWT_SECRET,

                {
                    expiresIn: "1d"
                }
            );


        res.json({

            message: "Login successful",

            token,

            doctor: {

                doctorId: doctor.doctor_id,
                name: doctor.name,
                specialization: doctor.specialization,
                phone: doctor.phone,
                email: doctor.email

            }

        });


    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server error"
        });

    }

});


// ===============================
// DOCTOR'S PATIENT RECORDS
// ===============================

router.get(
    "/records/:doctorId",
    async (req, res) => {

        try {

            const result =
                await pool.query(
                    `
                    SELECT
                        mr.*,
                        p.name AS patient_name,
                        p.age,
                        p.gender,
                        n.name AS nurse_name

                    FROM medical_records mr

                    JOIN patients p
                    ON mr.patient_id = p.patient_id

                    LEFT JOIN nurses n
                    ON mr.nurse_id = n.nurse_id

                    WHERE mr.doctor_id = $1

                    ORDER BY mr.record_date DESC
                    `,
                    [req.params.doctorId]
                );


            res.json(result.rows);


        } catch (error) {

            console.log(error);

            res.status(500).json({
                message: "Could not get records"
            });

        }

    }
);


module.exports = router;