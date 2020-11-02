import React from 'react'

import { Link } from 'react-router-dom'

import { Navbar, Nav } from 'react-bootstrap'

function Header() {
    return (
        <Navbar bg="light">
            <Navbar.Brand>A Tool For Video Based Learning</Navbar.Brand>
            <Nav.Link as={Link} to={"/"}>Home</Nav.Link>
            <Nav.Link as={Link} to={"/lectures/list"}>List lectures</Nav.Link>
        </Navbar>
    )
}

export default Header