import { useState } from "react";
import axios from "axios";

function NurseLogin({ onLogin }) {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [message, setMessage] = useState("");


    const login = async (e) => {

        e.preventDefault();

        try {

            const response =
                await axios.post(
                    "http://localhost:5000/api/nurses/login",
                    {
                        email,
                        password
                    }
                );


            localStorage.setItem(
                "nurseToken",
                response.data.token
            );


            onLogin(response.data.nurse);


        } catch (error) {

            setMessage(
                error.response?.data?.message ||
                "Login failed"
            );

        }

    };


    return (

        <div className="form-container">

            <h2>Nurse Login</h2>

            <form onSubmit={login}>

                <input
                    type="email"
                    placeholder="Email"
                    onChange={
                        e => setEmail(e.target.value)
                    }
                    required
                />

                <input
                    type="password"
                    placeholder="Password"
                    onChange={
                        e => setPassword(e.target.value)
                    }
                    required
                />

                <button>
                    Login
                </button>

            </form>

            <p>{message}</p>

        </div>

    );

}

export default NurseLogin;