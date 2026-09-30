import { useEffect, useState } from "react";
import axios from "axios";

function PatientDashboard({ patient, logout }) {

    const [records, setRecords] = useState([]);


    useEffect(() => {

        axios
            .get(
                `http://localhost:5000/api/patients/records/${patient.patientId}`
            )
            .then(response => {

                setRecords(response.data);

            })
            .catch(error => {

                console.log(error);

            });

    }, [patient.patientId]);


    return (

        <div className="dashboard">

            <h1>Patient Dashboard</h1>

            <h2>
                Welcome, {patient.name}
            </h2>

            <div className="profile">

                <p>
                    Patient ID:
                    <b>{patient.patientId}</b>
                </p>

                <p>
                    Age: {patient.age}
                </p>

                <p>
                    Gender: {patient.gender}
                </p>

                <p>
                    Email: {patient.email}
                </p>

                <p>
                    Phone: {patient.phone}
                </p>

            </div>


            <h2>My Medical Records</h2>


            {records.length === 0 ? (

                <p>No medical records available.</p>

            ) : (

                records.map(record => (

                    <div
                        className="record"
                        key={record.record_id}
                    >

                        <h3>
                            Record ID:
                            {record.record_id}
                        </h3>

                        <p>
                            Doctor:
                            {record.doctor_name}
                        </p>

                        <p>
                            Specialization:
                            {record.specialization}
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

                        <p>
                            Date:
                            {new Date(
                                record.record_date
                            ).toLocaleDateString()}
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

export default PatientDashboard;