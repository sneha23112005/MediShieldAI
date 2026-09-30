const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const pool = require("../db");

const router = express.Router();


// ===============================
// NURSE REGISTRATION
// ===============================

router.post("/register", async (req, res) => {

    try {

        const {
            name,
            department,
            phone,
            email,
            password
        } = req.body;


        const existing =
            await pool.query(
                "SELECT * FROM nurses WHERE email = $1",
                [email]
            );


        if (existing.rows.length > 0) {

            return res.status(400).json({
                message: "Nurse already exists"
            });

        }


        const last =
            await pool.query(`
                SELECT nurse_id
                FROM nurses
                ORDER BY nurse_id DESC
                LIMIT 1
            `);


        let number = 1;


        if (last.rows.length > 0) {

            number =
                parseInt(
                    last.rows[0].nurse_id.substring(3)
                ) + 1;

        }


        const nurseId =
            "NUR" + String(number).padStart(3, "0");


        const hashedPassword =
            await bcrypt.hash(password, 10);


        await pool.query(
            `
            INSERT INTO nurses
            (
                nurse_id,
                name,
                department,
                phone,
                email,
                password
            )
            VALUES ($1,$2,$3,$4,$5,$6)
            `,
            [
                nurseId,
                name,
                department,
                phone,
                email,
                hashedPassword
            ]
        );


        res.status(201).json({

            message: "Nurse registered successfully",

            nurseId

        });


    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server error"
        });

    }

});


// ===============================
// NURSE LOGIN
// ===============================

router.post("/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        const result =
            await pool.query(
                "SELECT * FROM nurses WHERE email = $1",
                [email]
            );


        if (result.rows.length === 0) {

            return res.status(404).json({
                message: "Nurse not found"
            });

        }


        const nurse = result.rows[0];


        const valid =
            await bcrypt.compare(
                password,
                nurse.password
            );


        if (!valid) {

            return res.status(401).json({
                message: "Incorrect password"
            });

        }


        const token =
            jwt.sign(
                {
                    nurseId: nurse.nurse_id,
                    role: "nurse"
                },

                process.env.JWT_SECRET,

                {
                    expiresIn: "1d"
                }
            );


        res.json({

            message: "Login successful",

            token,

            nurse: {

                nurseId: nurse.nurse_id,
                name: nurse.name,
                department: nurse.department,
                phone: nurse.phone,
                email: nurse.email

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
// NURSE PATIENT RECORDS
// ===============================

router.get(
    "/records/:nurseId",
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
                        d.name AS doctor_name

                    FROM medical_records mr

                    JOIN patients p
                    ON mr.patient_id = p.patient_id

                    JOIN doctors d
                    ON mr.doctor_id = d.doctor_id

                    WHERE mr.nurse_id = $1

                    ORDER BY mr.record_date DESC
                    `,
                    [req.params.nurseId]
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