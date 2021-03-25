import React from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

import { LectureList, Lecture, UserTest } from '../pages'

import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
    return (
        <Router>
            <Switch>
                <Route path="/" exact component={LectureList} />
                <Route path="/usertest/:lecture" component={UserTest} />
                <Route
                    path="/lectures/:id/:user"
                    exact
                    component={Lecture}
                />
            </Switch>
        </Router>
    )
}

export default App