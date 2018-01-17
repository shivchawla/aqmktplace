import * as React from 'react';
import {Table} from 'antd';
import {AqLink} from '../components';

export class ScreenAdvices extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            addData: []
        };
    }

    render() {
        const columns = [{
            title: 'Name',
            dataIndex: 'name',
            key: 'name'
            },
            {
                title: 'Age',
                dataIndex: 'age',
                key: 'age'
            },
            {
                title: 'Address',
                dataIndex: 'address',
                key: 'address'
            }
        ];
        const data = [
            {
                key: 1,
                name: 'Saurav',
                age: '23+',
                address: 'Bangalore'
            },
            {
                key: 2,
                name: 'Shaunak',
                age: '24+',
                address: 'Bangalore'
            },
            {
                key: 3,
                name: 'Suraj',
                age: '22+',
                address: 'Kolkata'
            },
            {
                key: 4,
                name: 'Arjun',
                age: '24+',
                address: 'Kalchini'
            }
        ];
        const nestedColumns = [
            {
                title: 'Symbol',
                dataIndex: 'symbol',
                key: 'symbol',
                width: 200
            },
            {
                title: 'Last Price',
                dataIndex: 'lastPrice',
                key: 'symbol',
                width: 200
            },
            {
                title: 'Shares',
                children: [
                    {
                        title: 'New Portfolio',
                        dataIndex: 'newPortfolio',
                        key: 'newPortfolio',
                        width: 200
                    },
                    {
                        title: 'Old Portfolio',
                        dataIndex: 'oldPortfolio',
                        key: 'oldPortfolio',
                        width: 200
                    },
                    {
                        title: 'Advice',
                        dataIndex: 'advice',
                        key: 'advice',
                        width: 200
                    }
                ]
            }
        ];
        const nestedData = [
            {
                symbol: 'TCS',
                lastPrice: '25.99',
                newPortfolio: '26.99',
                oldPortfolio: '24.99',
                advice: '20'
            },
            {
                symbol: 'GOOGL',
                lastPrice: '22.99',
                newPortfolio: '36.99',
                oldPortfolio: '44.99',
                advice: '29'
            }
        ]

        return (
            <div>
                <AqLink to='/advice/1' pageTitle='Advice Detail'/>
                <Table bordered columns={nestedColumns} dataSource={nestedData}/>
            </div>
        );
    }
}