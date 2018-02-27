import * as React from 'react';
import {TransitionGroup, CSSTransition} from 'react-transition-group'
import {Table, Input, Row, Col, Button, List} from 'antd';
import {adviceTransactions} from '../mockData/AdviceTransaction';
import {AqLink, AdviceTransactionTable} from '../components';

import '../css/screenAdvices.css';

const duration = 300;

export class ScreenAdvices extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            age: 0, 
            users: []
        };
    }

    addUser = () => {
        const users = [...this.state.users];
        users.push({
            name: this.state.name,
            age: this.state.age,
            key: users.length + 1
        });
        this.setState({users});
    }

    onChange = (e) => {
        this.setState({
            [e.target.id]: e.target.value
        });
    }

    renderItems = () => {
        return this.state.users.map((item, index) => {
            return (
                <Fade key={index}>
                    <Col span={24}>{item.name} - {item.age}</Col>
                </Fade>
            )
        });
    }

    render() {
        return (
            <Row>
                <Col span={24} className='col'>
                    <Input id="name" type="text" value={this.state.name} onChange={this.onChange} />
                    <Input id="age" type="number" value={this.state.age} onChange={this.onChange} />
                    <Button type="primary" onClick={this.addUser}>Add User</Button>
                </Col>
                <Col span={24}>
                    <TransitionGroup className='todo-list'>
                        {this.renderItems()}
                    </TransitionGroup>  
                </Col>
            </Row>
        );
    }
}

const Fade = ({ children, ...props }) => (
    <CSSTransition
        {...props}
        timeout={1000}
        classNames="fade"
    >
      {children}
    </CSSTransition>
);
