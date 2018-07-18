import React, { Component } from 'react';
import {Button} from 'antd';
import ReactDOM from 'react-dom';
import {withRouter} from 'react-router-dom';
import AppLayout from './AppLayout';
import {aboutUsText} from '../constants';

const AboutUsItem = (ref, item) => {
      
    return (
        <div ref={ref} className="full-screen-container" 
          style={{'background': 'white', 'padding': '4% 10% 4% 10%'}}>
          <h1 style={{'fontSize': 'calc(8px + 1.5vw)', 'fontWeight': 'bolder', 'marginTop': '10%'}}>{item.header}</h1>
          <p style={{'fontSize':'calc(7px + 1.5vw)', 'color': 'teal'}}>
            {item.tagline}
          </p>
          <div style={{'display': 'inline-flex', 'alignItems': 'center'}}>
              <div className="link-text" style={{'padding': '0px'}}>
                <h4 style={{'marginTop': '20px'}}>{item.main}</h4>
                {/*<div style={{'paddingTop': '25px'}}> 
                    <a href='mailto:connect@aimsquant.com'><Button type="primary" className="register-button">CONTACT US</Button></a>
                </div>*/}
              </div>
          </div>
        </div>
    );
}

class AboutUs extends Component {

  constructor(props){
  	super();
  	this.state = {

  	};

    this.handleScrollToElement = (key) =>{
      const tesNode = ReactDOM.findDOMNode(this.refs[key])
      if (tesNode){
        window.scrollTo(0, tesNode.offsetTop);
      }
    }
  }

  componentDidMount(){
  	if (this.props.pageChange){
  		this.props.pageChange('aboutUs');
  	}

    if (this.props.location){
      if (this.props.location.pathname === '/people'){
        setTimeout(() =>{
          this.handleScrollToElement('whoWeAre');
        }, 100);
      }else if (this.props.location.pathname === '/careers'){
        setTimeout(() =>{
          this.handleScrollToElement('careers');
        }, 100);
      }else if (this.props.location.pathname === '/connect'){
        setTimeout(() =>{
          this.handleScrollToElement('connectWithUs');
        }, 100);
      }else{
        setTimeout(() =>{
          this.handleScrollToElement('aboutUs');
        }, 100);
      }
    }

  }

  renderPageContent() {

    const {introduction, whatWeBuild, whoWeAre, careers, connect} = aboutUsText;

    return (
	    <div>
        <AboutUsItem ref="aboutUs" item={introduction}/>
        <AboutUsItem ref="whatWeBuild" item={whatWeBuild}/>
        <AboutUsItem ref="whoWeAre" item={whoWeAre}/>
        <AboutUsItem ref="careers" item={careers}/>
        <AboutUsItem ref="connectWithUs" item={connect}/>

        {/*<div ref="aboutUs" className="full-screen-container" 
          style={{'background': 'white', 'padding': '4% 10% 4% 10%'}}>
          <h1 style={{'fontSize': 'calc(8px + 1.5vw)', 'fontWeight': 'bolder'}}>About Us</h1>
          <p style={{'fontSize':'calc(7px + 1.5vw)', 'color': 'teal'}}>
            {introduction.tagline}
          </p>
          <div style={{'display': 'inline-flex', 'alignItems': 'center', 'padding': '2% 6% 0 6%'}}>
              <img className="link-image" src="./assets/images/link.png" alt="Link" />
              <div className="link-text">
                <h4>{introduction.main}</h4>
                <div style={{'paddingTop': '15px'}}>
                    <Button onClick={() => {this.handleScrollToElement('whatWeBuild')}} className="register-button">Read More</Button>
                </div>
              </div>
          </div>
        </div>
        <div ref="whatWeBuild" className="full-screen-container" 
          style={{'background': 'white', 'padding': '4% 10% 4% 10%'}}>
          <h1 style={{'fontSize': 'calc(8px + 1.5vw)', 'fontWeight': 'bolder', 'marginTop': '10%'}}>What are we building</h1>
          <p style={{'fontSize':'calc(7px + 1.5vw)', 'color': 'teal'}}>
            {whatWeBuild.tagline}
          </p>
          <div style={{'display': 'inline-flex', 'alignItems': 'center'}}>
              <div className="link-text" style={{'padding': '0px'}}>
                <h4 style={{'marginTop': '10px'}}>{whatWeBuild.main}</h4>
                <div style={{'paddingTop': '25px'}}> 
                    <Button onClick={() => {this.handleScrollToElement('whoWeAre')}} className="register-button">Read More</Button>
                </div>
              </div>
          </div>
        </div>
        <div ref="whoWeAre" className="full-screen-container" 
          style={{'background': 'white', 'padding': '4% 10% 4% 10%'}}>
          <h1 style={{'fontSize': 'calc(8px + 1.5vw)', 'fontWeight': 'bolder', 'marginTop': '10%'}}>Who We Are</h1>
          <p style={{'fontSize':'calc(7px + 1.5vw)', 'color': 'teal'}}>
            {whoWeAre.tagline}
          </p>
          <div style={{'display': 'inline-flex', 'alignItems': 'center'}}>
              <div className="link-text" style={{'padding': '0px'}}>
                <h4 style={{'marginTop': '20px'}}>{whoWeAre.main}</h4>
                <div style={{'paddingTop': '25px'}}> 
                    <Button onClick={() => {this.handleScrollToElement('careers')}} className="register-button">Read More</Button>
                </div>
              </div>
          </div>
        </div>
        <div ref="careers" className="full-screen-container" 
          style={{'background': 'white', 'padding': '4% 10% 4% 10%'}}>
          <h1 style={{'fontSize': 'calc(8px + 1.5vw)', 'fontWeight': 'bolder', 'marginTop': '10%'}}>Careers</h1>
          <p style={{'fontSize':'calc(7px + 1.5vw)', 'color': 'teal'}}>
            {careers.tagline}
          </p>
          <div style={{'display': 'inline-flex', 'alignItems': 'center'}}>
              <div className="link-text" style={{'padding': '0px'}}>
                <h4 style={{'marginTop': '20px'}}>{careers.main}</h4>
                <div style={{'paddingTop': '25px'}}> 
                    <a href='mailto:careers@aimsquant.com'><Button type="primary" className="register-button">APPLY FOR A JOB</Button></a>
                </div>
              </div>
          </div>
        </div>
        <div ref="connectWithUs" className="full-screen-container" 
          style={{'background': 'white', 'padding': '4% 10% 4% 10%'}}>
          <h1 style={{'fontSize': 'calc(8px + 1.5vw)', 'fontWeight': 'bolder', 'marginTop': '10%'}}>Connect With Us</h1>
          <p style={{'fontSize':'calc(7px + 1.5vw)', 'color': 'teal'}}>
            {connect.tagline}
          </p>
          <div style={{'display': 'inline-flex', 'alignItems': 'center'}}>
              <div className="link-text" style={{'padding': '0px'}}>
                <h4 style={{'marginTop': '20px'}}>{connect.main}</h4>
                <div style={{'paddingTop': '25px'}}> 
                    <a href='mailto:connect@aimsquant.com'><Button type="primary" className="register-button">CONTACT US</Button></a>
                </div>
              </div>
          </div>
        </div>*/}
	    </div>
    );
  }

  render() {
      return (
        <AppLayout content = {this.renderPageContent()}/>
      );
  }
}

export default withRouter(AboutUs);
