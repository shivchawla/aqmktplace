import * as React from 'react';
import _ from 'lodash';
import {Checkbox, Row, Col, Collapse} from 'antd';
import {horizontalBox, verticalBox, primaryColor, sectors} from '../../../constants';
import {sectorData} from '../../../constants/stockDetails';

const Panel = Collapse.Panel;

export default class StockFilter extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            filterData: this.getSectors(),
            selectedSector: null
        }
    }

    getSectors = () => {
        let uniqueSectors = _.uniq(sectorData.map(item => item.Sector));
        // Removing sectors that are blank
        uniqueSectors = uniqueSectors.filter(sector => sector.length > 0);
        return uniqueSectors.map(sector => {
            const uniqueSectorData = _.uniqWith(sectorData.filter(item => item.Sector === sector), _.isEqual);
            const industries = uniqueSectorData.map(item => {
                return {
                    industry: item.Industry,
                    checked: false
                }
            });

            return {sector, industries, checked: false}
        });
    }

    renderSectors = () => {
        const data = this.state.filterData;

        return (
            <Col 
                    span={24} 
                    style={{
                        width: '100%',
                    }}
            >
                {
                    data.map((sector, index) => {
                        return (
                            <SectorItem key={index} sector={sector} onClick={this.handleSectorClick}/>
                        )
                    })
                }
            </Col>
        );
    }

    renderIndustries = () => {
        const filterData = [...this.state.filterData];
        const selectedSectorIndex = _.findIndex(filterData, item => item.sector === this.state.selectedSector);
        const selectedSectors = filterData.filter(item => item.checked === true);
        let industries = [];
        selectedSectors.map(sector => {
            industries = [...industries, ...sector.industries]
        });

        return (
            <IndustryItemGroup 
                    industries={industries} 
                    sector={this.state.selectedSector}
                    onChange={this.handleIndustryClick}
            />
        );
    }

    getIndividualSectorsAndIndustries = (filterData) => {
        const selectedSectors = filterData.filter(item => item.checked === true);
        const sectors = selectedSectors.map(item => item.sector);
        let industries = [];
        selectedSectors.map(sector => {
            const selectedIndustries = sector.industries.filter(item => item.checked === true);
            const industryNames = selectedIndustries.map(item => item.industry);
            industries = [...industries, ...industryNames];
        });

        return {sectors, industries};
    }

    handleSectorClick = sector => {
        const sectorName = _.get(sector, 'sector', '');
        const filterData = [...this.state.filterData];
        const sectorIndex = _.findIndex(filterData, item => item.sector === sectorName);
        if(sectorIndex !== -1) {
            this.setState({selectedSector: sectorName});
            const targetSector = filterData[sectorIndex];
            targetSector.checked = !targetSector.checked;
            this.setState({filterData});
            this.props.onFilterChange(this.getIndividualSectorsAndIndustries(filterData));
        }
    }

    handleIndustryClick = (industry, sector) => {
        const filterData = [...this.state.filterData];
        const targetSectorIndex = _.findIndex(filterData, item => item.sector === sector);
        console.log(targetSectorIndex);
        console.log(sector);
        if (targetSectorIndex !== -1) {
            const targetSector = filterData[targetSectorIndex];
            const targetIndustryIndex = _.findIndex(targetSector.industries, item => item.industry === industry);
            if (targetIndustryIndex !== -1) {
                targetSector.industries[targetIndustryIndex].checked = !targetSector.industries[targetIndustryIndex].checked;
                this.setState({filterData});
                this.props.onFilterChange(this.getIndividualSectorsAndIndustries(filterData));
            }
        }
    }

    render() {
        return(
            <Row>
                <Col span={24}>
                    <Collapse bordered={false} defaultActiveKey={['1']}>
                        <Panel header="Sectors" key="1">
                            <Row>
                                {this.renderSectors()}
                            </Row>
                        </Panel>
                        {
                            this.state.filterData.filter(item => item.checked === true).length > 0 &&
                            <Panel header="Industries" key="2">
                                <Row>
                                    {this.renderIndustries()}
                                </Row>
                            </Panel>
                        }
                    </Collapse>
                </Col>
            </Row>
        );
    }
}

const SectorItem = ({sector, onClick}) => {
    const borderColor = sector.checked ? primaryColor : 'transparent';

    return (
        <Checkbox 
                checked={sector.checked}
                onChange={() => onClick(sector)}
                style={{width: '100%', margin: 0, marginLeft: '20px', marginBottom: '5px'}}
        >
            {sector.sector}
        </Checkbox>
    );
}

const IndustryItemGroup = ({industries, sector, onChange}) => {
    return (
        <Col span={24}>
            {
                industries.map((item, index) => (
                    <IndustryItem 
                        key={index} 
                        checked={item.checked} 
                        text={item.industry}
                        onChange={onChange}
                        sector={sector}
                    />
                ))
            }
        </Col>
    );
}

const IndustryItem = ({checked, text, onChange, sector}) => {
    return (
        <Checkbox 
                checked={checked} 
                onChange={() => onChange(text, sector)}
                style={{margin: '0', marginLeft: '20px', marginBottom: '5px'}}
        >
            {text}
        </Checkbox>
    );
}