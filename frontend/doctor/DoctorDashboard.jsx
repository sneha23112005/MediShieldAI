import { useEffect, useState } from "react";
import axios from "axios";

function DoctorDashboard({ doctor, logout }) {

    const [records, setRecords] = useState([]);


    useEffect(() => {

        axios
            .get(
                `http://localhost:5000/api/doctors/records/${doctor.doctorId}`
            )
            .then(response => {

                setRecords(response.data);

            });

    }, [doctor.doctorId]);


    return (

        <div className="dashboard">

            <h1>Doctor Dashboard</h1>

            <h2>
                Dr. {doctor.name}
            </h2>

            <p>
                Doctor ID:
                <b>{doctor.doctorId}</b>
            </p>

            <p>
                Specialization:
                {doctor.specialization}
            </p>


            <h2>My Patient Records</h2>


            {records.length === 0 ? (

                <p>No patient records available.</p>

            ) : (

                records.map(record => (

                    <div
                        className="record"
                        key={record.record_id}
                    >

                        <h3>
                            {record.patient_name}
                        </h3>

                        <p>
                            Patient ID:
                            {record.patient_id}
                        </p>

                        <p>
                            Age: {record.age}
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

export default DoctorDashboard;