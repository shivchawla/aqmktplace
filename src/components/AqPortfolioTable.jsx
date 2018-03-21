import * as React from 'react';
import {Table} from 'antd';

export class AqPortfolioTable extends React.Component {
    constructor(props) {
        super(props);
        this.columns = [
            {
                title: 'NO',
                dataIndex: 'no',
                key: 'no'
            },
            {
                title: 'SYMBOL',
                dataIndex: 'symbol',
                key: 'symbol'
            },
            {
                title: 'Country',
                dataIndex: 'country',
                key: 'country'
            },
            {
                title: 'Shares',
                dataIndex: 'shares',
                key: 'shares'
            },
            {
                title: 'Exchange',
                dataIndex: 'exchange',
                key: 'exchange'
            }, 
            {
                title: 'Security Type',
                dataIndex: 'securityType',
                key: 'securityType'
            }
        ];
    }

    render() {
        return (
            <Table 
                    pagination={false} 
                    columns={this.columns} 
                    style={{marginTop: 20, border: '1px solid #EAEAEA'}} 
                    dataSource={this.props.data}
            />
        );
    }
}