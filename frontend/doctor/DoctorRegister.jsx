import { useState } from "react";
import axios from "axios";

function DoctorRegister() {

    const [form, setForm] = useState({
        name: "",
        specialization: "",
        phone: "",
        email: "",
        password: ""
    });

    const [message, setMessage] = useState("");


    const change = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        });

    };


    const register = async (e) => {

        e.preventDefault();

        try {

            const response =
                await axios.post(
                    "http://localhost:5000/api/doctors/register",
                    form
                );


            setMessage(
                "Doctor registered! Doctor ID: " +
                response.data.doctorId
            );


        } catch (error) {

            setMessage(
                error.response?.data?.message ||
                "Registration failed"
            );

        }

    };


    return (

        <div className="form-container">

            <h2>New Doctor Registration</h2>

            <form onSubmit={register}>

                <input
                    name="name"
                    placeholder="Doctor Name"
                    onChange={change}
                    required
                />

                <input
                    name="specialization"
                    placeholder="Specialization"
                    onChange={change}
                    required
                />

                <input
                    name="phone"
                    placeholder="Phone"
                    onChange={change}
                    required
                />

                <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    onChange={change}
                    required
                />

                <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    onChange={change}
                    required
                />

                <button>
                    Register
                </button>

            </form>

            <p>{message}</p>

        </div>

    );

}

export default DoctorRegister;