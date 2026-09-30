const express = require("express");

const pool = require("../db");

const router = express.Router();


// ===============================
// CREATE MEDICAL RECORD
// ===============================

router.post("/add", async (req, res) => {

    try {

        const {
            patientId,
            doctorId,
            nurseId,
            diagnosis,
            prescription,
            notes
        } = req.body;


        // Check patient

        const patient =
            await pool.query(
                "SELECT * FROM patients WHERE patient_id = $1",
                [patientId]
            );


        if (patient.rows.length === 0) {

            return res.status(404).json({
                message: "Patient not found"
            });

        }


        // Generate REC001, REC002...

        const last =
            await pool.query(`
                SELECT record_id
                FROM medical_records
                ORDER BY record_id DESC
                LIMIT 1
            `);


        let number = 1;


        if (last.rows.length > 0) {

            number =
                parseInt(
                    last.rows[0].record_id.substring(3)
                ) + 1;

        }


        const recordId =
            "REC" + String(number).padStart(3, "0");


        const result =
            await pool.query(
                `
                INSERT INTO medical_records
                (
                    record_id,
                    patient_id,
                    doctor_id,
                    nurse_id,
                    diagnosis,
                    prescription,
                    notes
                )
                VALUES
                ($1,$2,$3,$4,$5,$6,$7)

                RETURNING *
                `,
                [
                    recordId,
                    patientId,
                    doctorId,
                    nurseId || null,
                    diagnosis,
                    prescription,
                    notes
                ]
            );


        res.status(201).json({

            message: "Medical record created",

            record: result.rows[0]

        });


    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Could not create record"
        });

    }

});


module.exports = router;