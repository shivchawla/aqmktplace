import * as React from 'react';
import {Table} from 'antd';
import {adviceTransactions} from '../mockData/AdviceTransaction';
import {AqLink, AdviceTransactionTable} from '../components';

export class ScreenAdvices extends React.Component {
    constructor(props) {
        super(props);
        
    }

    render() {
        
        return (
            <div>
                <AdviceTransactionTable advices={adviceTransactions} />
            </div>
        );
    }
}