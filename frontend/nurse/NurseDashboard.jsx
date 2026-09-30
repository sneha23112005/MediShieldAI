import { useEffect, useState } from "react";
import axios from "axios";

function NurseDashboard({ nurse, logout }) {

    const [records, setRecords] = useState([]);


    useEffect(() => {

        axios
            .get(
                `http://localhost:5000/api/nurses/records/${nurse.nurseId}`
            )
            .then(response => {

                setRecords(response.data);

            });

    }, [nurse.nurseId]);


    return (

        <div className="dashboard">

            <h1>Nurse Dashboard</h1>

            <h2>
                Welcome, {nurse.name}
            </h2>

            <p>
                Nurse ID:
                <b>{nurse.nurseId}</b>
            </p>

            <p>
                Department:
                {nurse.department}
            </p>


            <h2>Assigned Patient Records</h2>


            {records.length === 0 ? (

                <p>No patient records available.</p>

            ) : (

                records.map(record => (

                    <div
                        className="record"
                        key={record.record_id}
                    >

                        <h3>
                            Patient:
                            {record.patient_name}
                        </h3>

                        <p>
                            Patient ID:
                            {record.patient_id}
                        </p>

                        <p>
                            Doctor:
                            {record.doctor_name}
                        </p>

                        <p>
                            Diagnosis:
                            {record.diagnosis}
                        </p>

                        <p>
                            Prescription:
                            {record.prescription}
                        </p>

                        <p>
                            Notes:
                            {record.notes}
                        </p>

                    </div>

                ))

            )}


            <button onClick={logout}>
                Logout
            </button>

        </div>

    );

}

export default NurseDashboard;