import React, { Component } from 'react'
import api from '../api'

import styled from 'styled-components'

import { Link } from 'react-router-dom'
import { Container, Table } from 'react-bootstrap'


const Update = styled.div`
    color: #ef9b0f;
    cursor: pointer;
`

const Delete = styled.div`
    color: #ff0000;
    cursor: pointer;
`

class UpdateLecture extends Component {
    updateUser = event => {
        event.preventDefault()

        window.location.href = `/lectures/update/${this.props.id}`
    }

    render() {
        return <Update onClick={this.updateUser}>Update</Update>
    }
}

class DeleteLecture extends Component {
    deleteUser = event => {
        event.preventDefault()

        if (
            window.confirm(
                `Do tou want to delete the lecture ${this.props.id} permanently?`,
            )
        ) {
            api.deleteLectureById(this.props.id)
            window.location.reload()
        }
    }

    render() {
        return <Delete onClick={this.deleteUser}>Delete</Delete>
    }
}

class LecturesList extends Component {
    constructor(props) {
        super(props)
        this.state = {
            lectures: [],
            columns: [],
            isLoading: false,
        }
    }

    componentDidMount = async () => {
        this.setState({ isLoading: true })

        await api.getAllLectures().then(lectures => {
            this.setState({
                lectures: lectures.data.data,
                isLoading: false,
            })
        })
    }

    render() {
        const { lectures } = this.state

        return (
            <Container>
                <Table striped>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Title</th>
                            <th>Delete</th>
                            <th>Update</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lectures.map((lecture, index) => (
                        <tr key={index}>
                            <td><Link to={"/usertest/" + lecture._id} >{lecture._id}</Link></td>
                            <td>{lecture.title}</td>
                            <td><DeleteLecture id={lecture._id}/></td>
                            <td><UpdateLecture id={lecture._id}/></td>
                        </tr>))}
                    </tbody>

                </Table>
            </Container>
        )
    }
}

export default LecturesList