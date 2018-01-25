import * as React from 'react';
import {AqTableMod} from '../components';


export class AdviceDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: []
        };
    }

    onChange = (newData) => {
        this.setState({data: newData});
    } 
    
    handleSubmit = () => {
        console.log(this.state.data);
    }

    render() { 
        return (
            <div>
                <h1>Advice Detail{this.props.match.params.id}</h1>
                <AqTableMod onChange={this.onChange}/>
                <button onClick={this.handleSubmit}>Sumbit Form</button>
            </div>
        );
    }
}