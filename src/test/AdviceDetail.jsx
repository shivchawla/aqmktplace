import * as React from 'react';
import {AqTableMod} from '../components';


export class AdviceDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [
                {
                    ticker: '',
                    validationStatus: 'warning',
                    key: 0
                },
                {
                    ticker: '',
                    validationStatus: 'warning',
                    key: 1
                },
                {
                    ticker: '',
                    validationStatus: 'warning',
                    key: 2
                }
            ]
        };
    }
    renderData = () => {
        return this.state.data.map((item, index) => {
            return(
                <li key={index}>{item.ticker} - {item.validationStatus}</li>
            );
        })
    }

    onChange = (newData) => {
        this.setState({data: newData});
    } 
    
    handleSubmit = () => {
        console.log(this.state.data);
    }

    addItem = () => {
        this.setState((prevState) => {
            return prevState.data.push({
                ticker: '',
                validationStatus: 'error',
                key: this.state.data.length
            })
        });
    }

    render() { 
        return (
            <div>
                <h1>Advice Detail{this.props.match.params.id}</h1>
                <AqTableMod data={this.state.data} onChange={this.onChange}/>
                <ul>{this.renderData()}</ul>
                <button onClick={this.handleSubmit}>Sumbit Form</button>
                <button onClick={this.addItem}>Add Item</button>
            </div>
        );
    }
}