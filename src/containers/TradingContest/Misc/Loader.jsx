import React from 'react';
import Loader from 'react-loaders';
import {Row, Col} from 'antd';
import {primaryColor} from '../../../constants';
import {PacmanLoader} from 'react-spinners';

export default class LoaderComponent extends React.Component {
    render() {
        return (
            <Row style={{height: global.screen.height - 100, width: '100%'}} type="flex" align="middle" justify="center">
                <PacmanLoader
                    sizeUnit={"px"}
                    size={15}
                    color={primaryColor}
                    loading={true}
                />
            </Row>
        );
    }
}
