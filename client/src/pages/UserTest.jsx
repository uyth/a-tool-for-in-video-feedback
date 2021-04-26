import React, { useState } from "react";
import { Form, Button, InputGroup, FormControl } from "react-bootstrap";
import { useHistory, useParams } from 'react-router-dom';

export default function UserTest() {

  const history = useHistory();

  let { lecture } = useParams();

  let [code, setCode] = useState("");

  function handleSubmit() {
    history.push("/lectures/" + lecture + "/" + code);
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        height: "100vh",
        width: "100vw",
        background: "#f0f0f0"
      }}
    >
      <div style={{ margin: "auto" }}>
        <h1>Welcome to the user test!</h1>
        <Form inline onSubmit={handleSubmit}>
          <InputGroup>
            <FormControl placeholder="Your code" value={code} onChange={(e) => setCode(e.target.value)}/>
            <InputGroup.Append>
              <Button variant="primary" onClick={handleSubmit}>Submit</Button>
            </InputGroup.Append>
          </InputGroup>
        </Form>
      </div>
    </div>
  );
}
