import React from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

import { Header } from '../components'
import { LectureList, Lecture } from '../pages'

import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
    return (
        <Router>
            <Header />
            <Switch>
                <Route path="/lectures/list" exact component={LectureList} />
                <Route
                    path="/lectures/:id"
                    exact
                    component={Lecture}
                />
            </Switch>
        </Router>
    )
}

export default App