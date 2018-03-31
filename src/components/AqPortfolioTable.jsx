import * as React from 'react';
import {Table} from 'antd';

export class AqPortfolioTable extends React.Component {
    constructor(props) {
        super(props);
        this.columns = [
            {
                title: 'NAME',
                dataIndex: 'name',
                key: 'name'
            },
            {
                title: 'SYMBOL',
                dataIndex: 'symbol',
                key: 'symbol'
            },
            {
                title: 'SHARES',
                dataIndex: 'shares',
                key: 'shares'
            },
            {
                title: 'PRICE',
                dataIndex: 'price',
                key: 'price'
            },
            {
                title: 'SECTOR',
                dataIndex: 'sector',
                key: 'sector'
            }, {
                title: 'WEIGHT',
                dataIndex: 'weight',
                key: 'weight'
            }
        ];
    }

    render() {
        return (
            <Table 
                    size="small"
                    pagination={false} 
                    columns={this.columns} 
                    // style={{marginTop: 20, border: '1px solid #EAEAEA'}} 
                    dataSource={this.props.data}
            />
        );
    }
}