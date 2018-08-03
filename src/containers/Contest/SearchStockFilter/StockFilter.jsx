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
                    sector,
                    checked: false
                }
            });

            return {sector, industries, checked: -1}
        });
    }

    renderSectors = () => {
        let data = this.state.filterData;
        const sector = _.get(this.props, 'filters.sector', null);
        const industry = _.get(this.props, 'filters.industry', null);
        if (sector !== null && sector.length > 0) {
            data = data.filter(item => item.sector === sector);
        }

        return (
            <Col 
                    span={24} 
                    style={{
                        width: '100%',
                    }}
            >
                <Collapse defaultActiveKey={['1']} bordered={false}>
                    {
                        data.map((sector, index) => {
                            const sectorPanelHeader = (
                                <div style={horizontalBox}>
                                    <Checkbox 
                                            onClick={(e) => e.stopPropagation()}
                                            checked={sector.checked === 1}
                                            indeterminate = {sector.checked === 0}
                                            onChange={() => this.handleSectorClick(sector)}
                                            style={{marginRight: '5px'}}
                                    />
                                    <span style={{fontSize: '14px'}}>{sector.sector}</span>
                                </div>
                            )

                            return (
                                <Panel style={customPanelStyle} header={sectorPanelHeader} key={(index + 1).toString()}>
                                    <Row>
                                        <Col span={24}>
                                            <SectorItem 
                                                    key={index} 
                                                    sector={sector} 
                                                    onChange={this.handleIndustryClick}
                                            />
                                        </Col>
                                    </Row>
                                </Panel>
                            )
                        })
                    }
                </Collapse>
            </Col>
        );
    }

    renderIndustries = () => {
        const filterData = [...this.state.filterData];
        const selectedSectors = filterData.filter(item => item.checked === true);
        let industries = [];
        selectedSectors.map(sector => {
            industries = [...industries, ...sector.industries]
        });

        return (
            <IndustryItemGroup 
                    industries={industries} 
                    onChange={this.handleIndustryClick}
            />
        );
    }

    getIndividualSectorsAndIndustries = (filterData) => {
        const selectedSectors = filterData.filter(item => item.checked >= 0);
        const sectors = selectedSectors.map(item => item.sector);
        let industries = [];
        filterData.map(sector => {
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
            targetSector.checked = targetSector.checked === 0 // intermediate
                    ? 1 // checked
                    : targetSector.checked === 1 // checked
                        ? -1 // un-checked
                        : 1; // checked
            // Update all the industries of that particular sector
            targetSector.industries.map(item => {
                item.checked = targetSector.checked === 1;
            });
            this.setState({filterData});
            this.props.onFilterChange(this.getIndividualSectorsAndIndustries(filterData));
        }
    }

    // returns
    // 0: if some of the industries are selected
    // 1: if all of the industries are selected
    // -1: if none of the industries are selected
    checkForActiveIndustries = (sector) => {
        const filterData = [...this.state.filterData];
        const targetSectorIdx = _.findIndex(filterData, item => item.sector === sector);
        if (targetSectorIdx !== -1) {
            const targetSector = filterData[targetSectorIdx];
            let activeIndustriesCount = 0;
            targetSector.industries.map(item => {
                item.checked === true && activeIndustriesCount++;
            })
            return activeIndustriesCount === 0
                    ? -1
                    : activeIndustriesCount < targetSector.industries.length
                        ? 0
                        : 1
        } else {
            return -1;
        }
    }

    handleIndustryClick = (event, industry, sector) => {
        const checked = event.target.checked;
        const filterData = [...this.state.filterData];
        const targetSectorIndex = _.findIndex(filterData, item => item.sector === sector);
        if (targetSectorIndex !== -1) {
            const targetSector = filterData[targetSectorIndex];
            const targetIndustryIndex = _.findIndex(targetSector.industries, item => item.industry === industry);
            if (targetIndustryIndex !== -1) {
                targetSector.industries[targetIndustryIndex].checked = checked;
                // setting the checkbox select status based on the number of industries selected for that sector
                targetSector.checked = this.checkForActiveIndustries(sector);
                this.setState({filterData});
                this.props.onFilterChange(this.getIndividualSectorsAndIndustries(filterData));
            }
        }
    }

    render() {
        return(
            <Row>
                <Col span={24}>
                    <h3 
                        style={{
                            fontSize: '15px', 
                            fontWeight: 700,
                            margin: '10px 0px',
                            marginLeft: '20px'
                        }}
                    >
                        Filter Stocks
                    </h3>
                </Col>
                {this.renderSectors()}
            </Row>
        );
    }
}

const SectorItem = ({sector, onChange}) => {
    return (
        <IndustryItemGroup 
            industries={sector.industries} 
            onChange={onChange} />
        )
}

const IndustryItemGroup = ({industries, onChange}) => {
    return (
        <Col span={24}>
            {
                industries.map((item, index) => (
                    <IndustryItem 
                        key={index} 
                        checked={item.checked} 
                        text={item.industry}
                        onChange={onChange}
                        sector={item.sector}
                    />
                ))
            }
        </Col>
    );
}

const IndustryItem = ({checked, text, onChange, sector}) => {
    return (
        <Row>
            <Col span={24}>
                <Checkbox 
                        checked={checked} 
                        onChange={value => onChange(value, text, sector)}
                        style={{margin: '0', marginLeft: '20px', marginBottom: '5px', fontSize: '13px'}}
                >
                    {text}
                </Checkbox>
            </Col>
        </Row>
    );
}

const customPanelStyle = {
    background: '#fff',
    borderRadius: 4,
    marginBottom: 5,
    border: 0,
    overflow: 'hidden',
    borderBottom: '1px solid #eaeaea'
  };