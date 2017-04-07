import React, { PropTypes } from 'react'
import { Field, formValueSelector } from 'redux-form'
import { fields } from '../components'
import { connect } from 'react-redux'

class RepeatEventFormComponent extends React.Component {

    constructor(props) {
        super(props)
        const { endRepeatMode } = props

        if (endRepeatMode) {
            this.state = { endRepeatMode: endRepeatMode }
        } else {
            // if endRepeatMode not present set the default value for it
            this.state = { endRepeatMode: 'unlimited' }
            this.props.change('dates.recurring_rule.endRepeatMode', 'unlimited')
        }
    }

    componentWillReceiveProps(nextProps) {
        const { endRepeatMode, until, count } = nextProps

        if (until) {
            // force the selection of 'until' for endRepeatMode
            // covers the case when the user set a value for until date field
            // but don't select the 'until'related radio
            this.setState({ endRepeatMode: 'until' })
            return
        }

        if (count) {
            // force the selection of 'count' for endRepeatMode
            // covers the case when the user set a value for count integer field
            // but don't select the 'until'related radio
            this.setState({ endRepeatMode: 'count' })
            return
        }

        if (endRepeatMode && endRepeatMode !== this.state.endRepeatMode) {
            this.setState({ endRepeatMode: endRepeatMode })
        }
    }

    handleEndRepeatModeChange(e) {
        const choicesWithInput = ['count', 'until']

        //we clear inputs that belong to radiobox
        choicesWithInput.forEach((fieldName) =>
            this.props.change('dates.recurring_rule.' + fieldName, null)
        )

        // if the clicked radiobox belongs to an input field
        if (choicesWithInput.indexOf(e.target.value) > -1) {
            // focus the field
            this.refs['recurring_rule--' + e.target.value].getRenderedComponent().focus()
        }

        this.props.change('dates.recurring_rule.endRepeatMode', e.target.value)
        this.setState({ endRepeatMode:  e.target.value })
    }

    render() {
        const frequences = {
            YEARLY: 'years',
            MONTHLY: 'months',
            WEEKLY: 'weeks',
            DAILY: 'days',
        }

        return (
            <div>
                <div>
                    <label>Repeats</label>
                    <Field name="dates.recurring_rule.frequency" component="select">
                        {/* values come from http://tinyurl.com/hqol55p */}
                        <option value="YEARLY">Yearly</option>
                        <option value="MONTHLY">Monthly</option>
                        <option value="WEEKLY">Weekly</option>
                        <option value="DAILY">Daily</option>
                    </Field>
                </div>
                <div className="recurring__interval">
                    <label>Repeat Every</label>
                    <Field name="dates.recurring_rule.interval" component="select">
                        {/* Create 30 options with 1...30 values */}
                        {Array.apply(null, { length: 30 }).map(Number.call, Number).map((n) => (
                            <option key={n + 1} value={n + 1}>
                                {n + 1} {frequences[this.props.frequency]}
                            </option>
                        ))}
                    </Field>
                </div>
                { this.props.frequency === 'WEEKLY' &&
                    <div>
                        <label htmlFor="dates.recurring_rule.byday">Repeat on</label>
                        <Field name="dates.recurring_rule.byday" component={fields.DaysOfWeek} />
                    </div>
                }
                <div className="recurring__ends">
                    <label>Ends</label>
                    <label>
                        <input
                            name="endRepeatMode"
                            checked={this.state.endRepeatMode === 'unlimited'}
                            onChange={this.handleEndRepeatModeChange.bind(this)}
                            value="unlimited"
                            type="radio"/>
                        Never
                    </label>
                    <label>
                        <input
                            name="endRepeatMode"
                            checked={this.state.endRepeatMode === 'count'}
                            onChange={this.handleEndRepeatModeChange.bind(this)}
                            value="count"
                            type="radio"/>
                        After
                        <Field name="dates.recurring_rule.count"
                            text="occurrences"
                            withRef={true}
                            ref="recurring_rule--count"
                            component={fields.InputIntegerField} />
                    </label>
                    <label>
                        <input
                            name="endRepeatMode"
                            checked={this.state.endRepeatMode === 'until'}
                            onChange={this.handleEndRepeatModeChange.bind(this)}
                            value="until"
                            type="radio"/>
                        <span htmlFor="dates.recurring_rule.until">On</span>
                        <Field name="dates.recurring_rule.until"
                           withRef={true}
                           ref="recurring_rule--until"
                           component={fields.DayPickerInput} />
                    </label>
                </div>
            </div>
        )
    }
}
RepeatEventFormComponent.propTypes = {
    change: PropTypes.func.isRequired,
    frequency: PropTypes.oneOf(['YEARLY', 'MONTHLY', 'WEEKLY', 'DAILY']),
    endRepeatMode: PropTypes.oneOf(['unlimited', 'count', 'until']),
    until: PropTypes.object,
    count: PropTypes.string,
}

// This is the same name defined in EventForm.jsx because it is just a sub form
const selector = formValueSelector('addEvent')
const mapStateToProps = (state) => ({
    frequency: selector(state, 'dates.recurring_rule.frequency'),
    endRepeatMode: selector(state, 'dates.recurring_rule.endRepeatMode'),
    until: selector(state, 'dates.recurring_rule.until'),
    count: selector(state, 'dates.recurring_rule.count'),
})

export const RepeatEventForm = connect(mapStateToProps)(RepeatEventFormComponent)