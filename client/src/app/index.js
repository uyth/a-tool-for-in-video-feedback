import React from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

import { LectureList, Lecture, UserTest, Code } from '../pages'

import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
    return (
        <Router>
            <Switch>
                <Route path="/" exact component={LectureList} />
                <Route path="/usertest/:lecture" component={UserTest} />
                <Route
                    path="/lectures/:lectureId/:code"
                    exact
                    component={Lecture}
                />
                <Route path="/code" component={Code}/>
            </Switch>
        </Router>
    )
}

export default App