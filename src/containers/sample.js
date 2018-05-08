<Col xl={18} md={24} style={shadowBoxStyle}>
                        {/* <StatusBar color={statusBarColor} /> */}
                        <Row className="row-container" type="flex" justify="space-between">
                            <Col span={18}>
                                <h1 style={adviceNameStyle}>{name}</h1>
                                {
                                    advisor.user &&
                                    <h5 
                                            style={{...userStyle, cursor: 'pointer'}} 
                                            onClick={() => this.props.history.push(`/advisordashboard/advisorProfile/${advisor._id}`)}
                                    >
                                        By <span style={{color: primaryColor}}>{advisor.user.firstName} {advisor.user.lastName}</span>
                                        <span style={dateStyle}>{updatedDate}</span>
                                    </h5>
                                }
                                <AqRate value={this.state.adviceDetail.rating} />
                            </Col>
                            <Col xl={0} md={6}>
                                {this.renderActionButtons()}
                            </Col>
                        </Row>
                        <Row className="row-container">
                            {this.renderAdviceMetrics()}
                        </Row>
                        <Row>
                            <Col span={24} style={dividerStyle}></Col>
                        </Row>
                        <Collapse bordered={false} defaultActiveKey={defaultActiveKey} onChange={this.onCollapseChange}>
                            <Panel
                                    key="1"
                                    style={customPanelStyle}
                                    header={<h3 style={metricsHeaderStyle}>Description</h3>}
                            >
                                <Row className="row-container">
                                    <Col span={24}>
                                        <h5 style={{...textStyle, marginTop: '-10px', marginLeft: '20px'}}>{description}</h5>
                                    </Col>
                                </Row>
                            </Panel>

                            {
                                (this.state.adviceDetail.isSubscribed || this.state.adviceDetail.isOwner) &&

                                <Panel
                                    key="2"
                                    style={customPanelStyle}
                                    header={
                                        <Row type="flex" justify="space-between">
                                            <Col span={6}>
                                                <h3 style={metricsHeaderStyle}>Portfolio</h3>
                                            </Col>
                                        </Row>
                                    }>
                                    <Row className="row-container" type="flex" justify="end" align="middle">
                                        {this.state.adviceDetail.isOwner &&
                                            <Col span={6} style={{display: 'flex', justifyContent: 'flex-end', top: '225px', position:'absolute', zIndex:'2'}}>
                                                <DatePicker
                                                    value={this.state.selectedPortfolioDate}
                                                    onChange={this.handlePortfolioStartDateChange}
                                                    allowClear={false}/>
                                            </Col>
                                        }
                                        <Col span={24} style={{marginTop: '-10px'}}>
                                            <AqStockPortfolioTable
                                                composition
                                                portfolio={{positions: this.state.positions}}
                                                updateTicker={this.updateTicker}
                                            />
                                        </Col>
                                    </Row>
                                </Panel>
                            }
                            {
                                Utils.isLoggedIn() &&
                                <Panel
                                        key="3"
                                        style={customPanelStyle}
                                        header={<h3 style={metricsHeaderStyle}>Performance</h3>}
                                    >
                                    <Row className="row-container">
                                        <MyChartNew series={this.state.tickers} />
                                    </Row>
                                </Panel>
                            }
                        </Collapse>
                    </Col>