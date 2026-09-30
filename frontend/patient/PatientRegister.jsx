import { useState } from "react";
import axios from "axios";

function PatientRegister() {

    const [form, setForm] = useState({
        name: "",
        age: "",
        gender: "",
        phone: "",
        email: "",
        address: "",
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
                    "http://localhost:5000/api/patients/register",
                    form
                );


            setMessage(
                "Registration successful! Patient ID: " +
                response.data.patientId
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

            <h2>New Patient Registration</h2>

            <form onSubmit={register}>

                <input
                    name="name"
                    placeholder="Full Name"
                    onChange={change}
                    required
                />

                <input
                    name="age"
                    type="number"
                    placeholder="Age"
                    onChange={change}
                    required
                />

                <select
                    name="gender"
                    onChange={change}
                    required
                >

                    <option value="">
                        Select Gender
                    </option>

                    <option value="Male">
                        Male
                    </option>

                    <option value="Female">
                        Female
                    </option>

                    <option value="Other">
                        Other
                    </option>

                </select>

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
                    name="address"
                    placeholder="Address"
                    onChange={change}
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

export default PatientRegister;