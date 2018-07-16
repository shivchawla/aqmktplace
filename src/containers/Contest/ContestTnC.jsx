import * as React from 'react';
import {primaryColor} from '../../constants';
import AppLayout from '../../containers/AppLayout';

export default class ContestTnC extends React.Component {
    
    renderPageContent() {
        return (
            <div style={{padding: '20px 40px', fontSize: '16px'}}>
                <h1 style={{marginBottom:'40px'}}><span>Contest Rules</span></h1>
                <h3 style={h3Style}><span >Overview</span></h3>
                <p><span>The Contest at AdviceQube is a weekly competition that awards cash prizes to the best Investment Idea. The contest is based on Indian markets and designed to evaluate long only equity portfolio using subset of trade-able equities on National Stock Exchange, India . As such, contest entries are required to have certain structural properties. Entries that meet all the structural criteria are scored and ranked after each trading day. Each week, the top 5 participants are awarded a cash prize.</span></p>
                <p>&nbsp;</p>
                <h3 style={h3Style}><span >Eligibility</span></h3>
                <p style={bulletStyle}><span>1. To be eligible to take part in the Contest, Participants must have a registered AdviceQube account. If a Participant doesn&rsquo;t have an account yet, the Participant can sign up </span><a href="https://www.adviceqube.com/signup"><span >here</span></a><span >.</span></p>
                <p style={bulletStyle}><span >2. Participants must be at least 18 years old or older at the time of entry. Age may be verified prior to prize distribution.</span></p>
                <p style={bulletStyle}><span >3. Participants must be a citizen of India.</span></p>
                <p style={bulletStyle}><span >4. There is no fee for entry and no purchase is necessary.</span></p>
                <p>&nbsp;</p>
                <h3 style={h3Style}><span >Criteria</span></h3>
                <p><span >In order to be eligible for participation in the Contest, entries are required to meet a particular set of criteria. All entries are checked for applicable criteria before submission. In addition, after the submission of entry, criteria are checked at the end of every trading day for the time the entry remains active in the contest. If Participant&rsquo;s entry fails one or more of the criteria at any point during the contest, it will be disqualified from the Contest. These are the criteria that are required of all Contest Investment Idea:</span></p>
                <p><br /><strong>NIFTY_500 Stocks only</strong><span >: Contest entries can choose stocks only from a broad universe of NIFTY_500 stocks in addition to any other universe constraints introduced by the chosen benchmark. For ex: If you chose NIFTY_50 as the benchmark, then you have choose from any stocks in NIFTY_500. If you chose NIFTY_AUTO as the benchmark, then you can choose any stock that belongs to Automobile sector and is a part of NIFTY_500 universe.</span></p>
                <p><strong>Position count: </strong><span >Contest entries must have at-least </span><strong>ten</strong><span > positions at all times in the investment portfolio. </span></p>
                <p><strong>Low position concentration</strong><span >: Contest entries cannot have more than 10% of their capital invested in any one asset. This is checked at the end of each trading day. &nbsp;Due to market movement, your investment portfolio may exceed this limit to a hard limit of 12.5%. In case the limit exceed the hard limit of 12.5%, position must be adjusted immediately back to under 10%.</span></p>
                <p><strong>Sector count: </strong><span >&nbsp;Contest entries with diversified benchmark (NIFTY_50, NIFTY_MIDCAP_50 or NIFTY_DIV_OPPS_50) &nbsp;entries must have positions in at-least </span><strong>four</strong><span > sectors. </span></p>
                <p><strong>Low sector concentration</strong><span >: Contest entries with diversified benchmark (NIFTY_50, NIFTY_MIDCAP_50 or NIFTY_DIV_OPPS_50) cannot have more than 35% of their capital invested in any one sector. This is checked at the end of each trading day. &nbsp;Due to market movement, your investment portfolio may exceed this limit to a hard limit of 40%. In case the limit exceed the hard limit of 40%, position must be adjusted immediately back to under 35%.</span></p>
                <p><strong>Positive returns</strong><span >: Contest entries must have positive total excess returns as measured by performance of investment portfolio over the benchmark. For ex: If the chosen benchmark made 10%, then Contest entry must make more than 10%. This is used only at the end contest and not evaluated on a daily basis.</span></p>
                <p><strong>Maximum Loss</strong><span >: Contest entries must not lose more than 10% over the chosen benchmark. For ex: If the chosen benchmark is down (total return) by 5%, then the contest entry must not lose more than 15%. This criteria is evaluated at the end of every day. The entry will be disqualified for the contest if this criteria gets violated.</span></p>
                <h3 style={h3Style}><span >Submission</span></h3>
                <p style={bulletStyle}><span >1. Contest entry can be submitted before Sunday 12:00 AM. Contest entries submitted will be evaluated for period for 5 weeks starting that Sunday and results will be declared at the end of 5 weeks. Entries submitted after Sunday 12:00 AM will become a part of the next contest BUT will be evaluated from the beginning of the submission and score at the end of 5 weeks from next Sunday.</span></p>
                <p style={bulletStyle}><span >2. To submit an entry to the Contest, the participant must create a valid investment portfolio as mentioned above in Criteria (see &ldquo;Criteria&rdquo; section above).</span></p>
                <p style={bulletStyle}><span >3. To avoid any disqualification, the participant must update the investment portfolio for any necessary changes as mentioned above in Criteria (see &ldquo;Criteria&rdquo; section above)</span></p>
                <p style={bulletStyle}><span >4. Submitted entries do not need to be re-submitted on a weekly basis. Any submitted Investment Idea will run in the contest indefinitely, unless disqualified or manually withdrawn.</span></p>
                <p style={bulletStyle}><span >5. Each Participant may submit up to 3 algorithms to the contest.</span></p>
                <p style={bulletStyle}><span >6. Odds of winning depend on the total number of eligible entries.</span></p>
                <p style={bulletStyle}><span >7. To remove an entry from the contest, Participants may navigate to the 'Advice Detail' section of the entry and click the &ldquo;Withdraw from Contest&rdquo;.</span></p>
                <p style={bulletStyle}><span >8. Participant's entry must not violate or infringe on any applicable law or regulation or third-party rights.</span></p>
                <p style={bulletStyle}><span >9. Participant's intellectual property will remain Participant's property; However, we may look at Participant's Investment Portfolio for additional checks. We WILL NOT use/distribute participant&rsquo;s investment portfolio without explicit consent.</span></p>
                <p>&nbsp;</p>
                <h3 style={h3Style}><span >Scoring and Ranking</span></h3>
                <p><span >Contest entries that meet all the structural criteria (see &ldquo;Criteria&rdquo; section above) are ranked after every trading day based on a scoring function. The score of an entry is based on its out-of-sample excess returns over the benchmark. Entries are rewarded a high score for achieving high returns, high diversity and low risk.</span></p>
                <p><span >As the contest is designed to &nbsp;award Investment Ideas that perform better than the market. For this purpose, our scoring function will largely depend on excess Return over chosen benchmark.</span></p>
                <p><em><span >Excess Return &nbsp;= Return of Investment Idea - &nbsp;Return of Benchmark</span></em></p>
                <p><span >The Investment Idea is evaluated over multiple financial metrics based on </span><em><span >Excess Return. </span></em><span >Below if the list of metric used to evaluate the Investment Idea:</span></p>
                <p style={bulletStyle}><span >1. Annual Excess Return</span></p>
                <p style={bulletStyle}><span >2. Tracking Error</span></p>
                <p style={bulletStyle}><span >3. Maximum Loss</span></p>
                <p style={bulletStyle}><span >4. Information Ratio</span></p>
                <p style={bulletStyle}><span >5. Calmar Ratio</span></p>
                <p style={bulletStyle}><span >6. Portfolio Concentration</span></p>
                <p><br /><br /></p>
                <p><span >where R(c)</span><span >: </span><span >Fractional rank of Criteria c across all Investment Ideas</span></p>
                <p>&nbsp;</p>
                <p><span >At the end of each day, participants are ranked based on their highest scoring active entry at the end of that day. The minimum score that an entry or participant can have is 0. The top 10 participants will be displayed on the </span><a href="https://www.adviceqube.com/contest"><span >leaderboard</span></a><span > every day.</span></p>
                <p>&nbsp;</p>
                <h3 style={h3Style}><span >Other Rules</span></h3>
                <p style={bulletStyle}><span >1. Each Participant may have only one AdviceQube account. If the Participant submits entries from more than one account, all entries may be disqualified.</span></p>
                <p>&nbsp;</p>
                <h3 style={h3Style}><span >Reward</span></h3>
                <p><span >At the end of each week, the top 5 ranked participants will receive a cash prize. The prize structure is as follows:</span></p>
                <table>
                    <tbody>
                        <tr style={{height: '43.375px'}}>
                            <td style={{height: '43.375px'}}>
                                <p><span >PLACE</span></p>
                            </td>
                            <td style={{height: '43.375px'}}>
                                <p><span >REWARD</span></p>
                            </td>
                        </tr>
                        <tr style={{height: '46px'}}>
                            <td style={{height: '46px'}}>
                                <p><span >1st Place</span></p>
                            </td>
                            <td style={{height: '46px'}}>
                                <p><span >Rs. 4000</span></p>
                            </td>
                        </tr>
                        <tr style={{height: '46px'}}>
                            <td style={{height: '46px'}}>
                                <p><span >2nd Place</span></p>
                            </td>
                            <td style={{height: '46px'}}>
                                <p><span >Rs. 2500</span></p>
                            </td>
                        </tr>
                        <tr style={{height: '46px'}}>
                            <td style={{height: '46px'}}>
                                <p><span >3rd Place</span></p>
                            </td>
                            <td style={{height: '46px'}}>
                                <p><span >Rs. 1500</span></p>
                            </td>
                        </tr>
                        <tr style={{height: '46px'}}>
                            <td style={{height: '46px'}}>
                                <p><span >4th Place</span></p>
                            </td>
                            <td style={{height: '46px'}}>
                                <p><span >Rs. 1000</span></p>
                            </td>
                        </tr>
                        <tr style={{height: '46px'}}>
                            <td style={{height: '46px'}}>
                                <p><span >5th Place</span></p>
                            </td>
                            <td style={{height: '46px'}}>
                                <p><span >Rs. 1000</span></p>
                            </td>
                        </tr>
                        <tr style={{height: '18px'}}>
                            <td style={{height: '18px'}}>&nbsp;</td>
                            <td style={{height: '18px'}}>&nbsp;</td>
                        </tr>
                    </tbody>
                </table>
                <p><span >An individual may only win one prize per week. The top Investment Idea score can come from any of a participant&rsquo;s (up to) 3 active contest entries. In the event that multiple participants tie for a rank in the top 5, that prize, as well as the next </span><strong>n</strong><span > prizes will be split evenly among the tied participants, where </span><strong>n</strong><span > is the number of participants that tied for that rank. For example, if 3 people tie for 3rd place, the 3rd, 4th and 5th place prizes will be added together, and then split evenly by the tied participants. In the event that there are fewer than </span><strong>n</strong><span > prizes available , then the remaining prizes will be split evenly among the remaining winners. For example, if 2 people tie for 5th place, they will split the 5th place price evenly. Note that there is no advantage to submitting the same algorithm more than once; Participants are ranked based on their top entry each day.</span></p>
                <p>&nbsp;</p>
                <p><span >The overall score of each winner will be public during the prize period. No one, except AdviceQube, will see the winners&rsquo; Investment Idea.</span></p>
                <p><span >AdviceQube will email winners at the end of each week in order to pay out prizes. </span></p>
                <p>&nbsp;</p>
                <h3 style={h3Style}><span >General Conditions</span></h3>
                <p style={bulletStyle}><span >1. Prizes are non-transferable to other AdviceQube members or to other accounts.</span></p>
                <p style={bulletStyle}><span >2. AdviceQube reserves the right at its sole discretion to alter, amend, modify, suspend or terminate this Contest, or any aspect of it, including but not limited to changing the prize frequency, prize amount, criteria, scoring rules, at any time and without prior notice. In such event AdviceQube will make reasonable efforts to notify all Participants by email.</span></p>
                <p style={bulletStyle}><span >3. AdviceQube will make all reasonable efforts to support the acceptance of entries. Entries may not be successfully processed because of errors or failures. Those errors or failures may be caused by AdviceQube, the Participant, third parties, or a combination of parties. AdviceQube will not be liable or otherwise responsible for any entry that cannot be processed, regardless of the cause of the problem.</span></p>
                <p style={bulletStyle}><span >4. AdviceQube will have complete discretion over interpretation of the Contest Rules, administration of the Contest and selection of the Winners. Decisions of AdviceQube as to the administration of the Contest, interpretation of the Contest Rules and the selection of the Winners will be binding and final.</span></p>
                <p style={bulletStyle}><span >5. Participant agrees and gives his/her express consent for AdviceQube to use or publish without additional compensation in any medium (including, without limitation, in print, via television, via the internet, via email and or/other electronic form) and/or share with its agents, business partners and successors during and after the Contest, information for publicity purposes including photographs, videotape or digital recordings that AdviceQube &nbsp;takes of Participant, Participant's AdviceQube profile, public written statements, and Investment Idea performance for all or part of the Contest, without compensation. Participant hereby waives any rights, claims or interests that Participant may have to control the use of any or all of the publicity material in whatever medium used.</span></p>
                <p style={bulletStyle}><span >6. All current employees, interns, and contractors of AdviceQube; and their immediate family members; and their household members are prohibited from participating in the Contest.</span></p>
                <p style={bulletStyle}><span >7. This Contest is void where prohibited by law.</span></p>
                <p style={bulletStyle}><span >8. If any provision(s) of these Contest Rules is held to be invalid or unenforceable, all remaining provisions hereof will remain in full force and effect.</span></p>
                <p style={bulletStyle}><span >9. Contest Winners are solely responsible for the payment of any and all applicable taxes that may apply on their prize. AdviceQube shall have the right, but not the obligation, to make any deductions and withholdings that AdviceQube deems necessary or desirable under applicable tax laws, rules, regulations, codes or ordinances.</span></p>
                <p style={bulletStyle}><span >10. AdviceQube is not responsible for the actions of Participants in connection with the Contest, including Participants&rsquo; attempts to circumvent the Contest Rules or otherwise interfere with the administration, security, fairness, integrity or proper conduct of the Contest. Persons found tampering with or abusing any aspect of this Contest, or who AdviceQube believes to be causing or attempting to cause malfunction, error, disruption or damage will be disqualified. Additionally, any attempt to cheat the Contest, as determined at the sole discretion of AdvicQube, may result in immediate disqualification of the Participant, as well as other possible consequences, including temporary or permanent disqualification from the Contest. AdviceQube reserves the right, at its sole and absolute discretion, to disqualify any individual who is found to be, or suspected of, acting in violation of these Contest Rules, or to be acting in an un-sportsmanlike, obscene, immoral or disruptive manner, or with the intent to annoy, abuse, threaten or harass any other person.</span></p>
                <p style={bulletStyle}><span >11. These Contest Rules shall be governed by and subject to the AdviceQube </span><a href="https://www.adviceqube.com/policies/tnc"><span >Terms of Use</span></a><span > including the jurisdictional and dispute processes specified therein.</span></p>
                <p>&nbsp;</p>
                <h3 style={h3Style}><span >Binding Agreement</span></h3>
                <p><span >Participant agrees that by participating in the Contest that Participant will be bound by these Contest Rules (which may be amended or varied at any time by AdviceQube with or without notice) as well as the </span><a href="https://www.adviceqube.com/policies/tnc"><span >terms and conditions</span></a><span > that apply to Participant's use of the AdviceQube &nbsp;website.</span></p>
                <p>&nbsp;</p>
                <h3 style={h3Style}><span>Liability</span></h3>
                <p style={bulletStyle}><span >1. To the maximum extent permitted by law, Participant agrees to release, discharge and hold harmless AdviceQube and each of its parents, subsidiaries, affiliates, prize providers/suppliers, agents, representatives, retailers, and advertising and promotion agencies, and each of their respective directors, officers, employees, agents, successors and assigns (collectively, the "Released Parties"), from any and all liability, claims, losses, injuries, demands, damages, actions, and/or causes of actions whether direct or indirect, which may be due to or arise out of or in connection with the participation in the Contest or any portion thereof, or the awarding, acceptance, receipt, use or misuse or possession of the prizes or while preparing for or participating in any Contest-related activity (including, without limitation, liability for any property loss, damage, personal injury or death, violation of rights of publicity or privacy, or claims of defamation or portrayal in a false light; or based on any claim of infringement of intellectual property). Participants agree that the Released Parties shall have no responsibility or liability for discontinued prizes; human error; incorrect or inaccurate transcription of information; any technical malfunctions of the telephone network, computer equipment or systems, software, or Internet service provider utilized by AdviceQube; interruption or inability to access the Contest website or any online service via the Internet due to hardware or software compatibility problems; any damage to participant&rsquo;s (or any third person&rsquo;s) computer and/or its contents related to or resulting from any part of the Contest; any lost/delayed data transmissions, omissions, interruptions, defects; and/or any other errors or malfunctions, even if caused by the negligence of the Released Parties. Each participant further agrees to indemnify and hold harmless Released Parties from and against any and all liability resulting or arising from the Contest and to release all rights to bring any claim, action or proceeding against Released Parties and hereby acknowledges that Released Parties have neither made nor are in any manner responsible or liable for any warranty, representation or guarantee, express or implied, in fact or in law, relative to a prize, including express warranties provided exclusively by a prize supplier that may be sent along with a prize. The releases hereunder are intended to apply to all claims not known or suspected to exist with the intent of waiving the effect of laws requiring the intent to release future unknown claims.</span></p>
                <p style={bulletStyle}><span >2. PARTICIPANT AGREES THAT: (1) ANY AND ALL DISPUTES, CLAIMS AND CAUSES OF ACTION ARISING OUT OF OR CONNECTED WITH THE CONTEST, OR ANY PRIZE AWARDED, WILL BE RESOLVED INDIVIDUALLY, WITHOUT RESORT TO ANY FORM OF COLLECTIVE LEGAL ACTION; (2) ANY AND ALL CLAIMS, JUDGMENTS AND AWARDS WILL BE LIMITED TO ACTUAL THIRD-PARTY, OUT-OF-POCKET COSTS INCURRED, (IF ANY), NOT TO EXCEED TEN THOUSAND RUPEES(₨ 10,000.00), BUT IN NO EVENT WILL ATTORNEYS&rsquo; FEES BE AWARDED OR RECOVERABLE; (3) UNDER NO CIRCUMSTANCES WILL ANY PARTICIPANT BE PERMITTED TO OBTAIN ANY AWARD FOR, AND PARTICIPANT HEREBY KNOWINGLY AND EXPRESSLY WAIVES ALL RIGHTS TO SEEK, PUNITIVE, INCIDENTAL, CONSEQUENTIAL OR SPECIAL DAMAGES, LOST PROFITS AND/OR ANY OTHER DAMAGES, OTHER THAN ACTUAL OUT-OF-POCKET EXPENSES NOT TO EXCEED TEN THOUSAND RUPEES (₨ 10,000.00), AND/OR ANY RIGHTS TO HAVE DAMAGES MULTIPLIED OR OTHERWISE INCREASED; AND (4) PARTICIPANT&rsquo;S REMEDIES ARE LIMITED TO A CLAIM FOR MONEY DAMAGES (IF ANY) AND PARTICIPANT IRREVOCABLY WAIVES ANY RIGHT TO SEEK INJUNCTIVE OR EQUITABLE RELIEF. SOME JURISDICTIONS DO NOT ALLOW THE LIMITATIONS OR EXCLUSION OF LIABILITY FOR INCIDENTAL OR CONSEQUENTIAL DAMAGES, SO THE ABOVE MAY NOT APPLY TO THE PARTICIPANT.</span></p>
                <p>&nbsp;</p>
                <p><span >Last revised: 16 July 2018</span></p>
                <p><br /><br /><br /></p>
            </div>
        );
    }

    render() {
        return (
            <AppLayout content={this.renderPageContent()}/>
        );
    }
};

const h3Style = {
    fontSize: '18px',
    color: primaryColor
};

const bulletStyle = {
    marginBottom: '8px',
    lineHeight: '20px'
};