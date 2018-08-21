import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {gettext, getCreator} from '../../utils';
import * as selectors from '../../selectors';
import {get} from 'lodash';
import {Row} from '../UI/Preview';
import {
    AuditInformation,
    RelatedPlannings,
    StateLabel,
} from '../index';
import {EventScheduleSummary} from './';
import {ToggleBox} from '../UI';
import {ContentBlock} from '../UI/SidePanel';
import {LinkInput, FileInput} from '../UI/Form';
import {Location} from '../Location';
import eventsApi from '../../actions/events/api';
import {ContactMetaData} from '../Contacts/index';
import CustomVocabulariesPreview from '../CustomVocabulariesPreview';

export class EventPreviewContentComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showContactInfo: false,
            currentContact: [],
            editDetails: false,
            viewIndex: null,
            files: [],
        };
        this.getResponseResult = this.getResponseResult.bind(this);
    }

    componentWillMount() {
        this.props.fetchEventFiles(this.props.item);
    }

    getResponseResult(data = null) {
        let results = null;

        if (get(data, '_items.length', 0) > 0) {
            results = data._items;
        }

        return results;
    }

    getContactLabel(contact) {
        const avatarClass = (contact) => contact.first_name ? 'avatar' : 'avatar organisation';

        const displayContact = (contact) => (contact.first_name ?
            `${contact.first_name} ${contact.last_name}` : contact.organisation);

        const displayContactInfo = (contact) => (contact.first_name && contact.job_title && contact.organisation &&
                <h5>{contact.job_title}, {contact.organisation}</h5>);

        return (<span className="contact-info">
            <figure className={avatarClass(contact)} />
            <span>{displayContact(contact)} {displayContactInfo(contact)}</span>
        </span>);
    }

    getContactInfo(currentContact) {
        let contactLabel = this.getContactLabel(currentContact);

        return {
            label: (<span>{contactLabel}</span>),
            value: currentContact,
        };
    }

    render() {
        const {
            item,
            users,
            desks,
            formProfile,
            timeFormat,
            dateFormat,
            createUploadLink,
            streetMapUrl,
            customVocabularies,
            hideRelatedItems,
            files,
        } = this.props;
        const createdBy = getCreator(item, 'original_creator', users);
        const updatedBy = getCreator(item, 'version_creator', users);
        const creationDate = get(item, '_created');
        const updatedDate = get(item, '_updated');
        const versionCreator = get(updatedBy, 'display_name') ? updatedBy :
            users.find((user) => user._id === updatedBy);

        const calendarsText = get(item, 'calendars.length', 0) === 0 ? gettext('No calendars assigned.') :
            item.calendars.map((c) => c.name).join(', ');
        const placeText = get(item, 'place.length', 0) === 0 ? '' :
            item.place.map((c) => c.name).join(', ');
        const categoryText = get(item, 'anpa_category.length', 0) === 0 ? '' :
            item.anpa_category.map((c) => c.name).join(', ');
        const subjectText = get(item, 'subject.length', 0) === 0 ? '' :
            item.subject.map((s) => s.name).join(', ');


        return (
            <ContentBlock>
                <div className="side-panel__content-block--flex">
                    <div className="side-panel__content-block-inner side-panel__content-block-inner--grow">
                        <AuditInformation
                            createdBy={createdBy}
                            updatedBy={versionCreator}
                            createdAt={creationDate}
                            updatedAt={updatedDate}
                        />
                    </div>
                    <div className="side-panel__content-block-inner side-panel__content-block-inner--right">
                        <StateLabel
                            item={item}
                            verbose={true}
                            withExpiredStatus={true}
                        />
                    </div>
                </div>

                <Row
                    enabled={get(formProfile, 'editor.slugline.enabled')}
                    label={gettext('Slugline')}
                    value={item.slugline || ''}
                    className="slugline"
                />
                <Row
                    enabled={get(formProfile, 'editor.name.enabled')}
                    label={gettext('Event name')}
                    value={item.name || ''}
                    className="strong"
                />
                <Row
                    enabled={get(formProfile, 'editor.definition_short.enabled')}
                    label={gettext('Description')}
                    value={item.definition_short || ''}
                />
                <Row
                    enabled={get(formProfile, 'editor.occur_status.enabled')}
                    label={gettext('Occurrence Status')}
                    value={get(item, 'occur_status.name', '')}
                />
                <EventScheduleSummary schedule={item.dates} timeFormat={timeFormat} dateFormat={dateFormat}/>

                <Row
                    enabled={get(formProfile, 'editor.calendars.enabled')}
                    label={gettext('Calendars')}
                    value={calendarsText}
                />

                <Row
                    enabled={get(formProfile, 'editor.location.enabled')}
                    label={gettext('Location')}
                >
                    <div>
                        <Location
                            name={get(item, 'location.name')}
                            address={get(item, 'location.formatted_address')}
                            mapUrl={streetMapUrl}
                            multiLine={true}
                        />
                    </div>
                </Row>

                <Row
                    enabled={get(formProfile, 'editor.event_contact_info.enabled') && get(item, '_contacts.length') > 0}
                    label={gettext('Contact')}
                >
                    {get(this.props, 'item._contacts.length', 0) > 0 &&
                        this.props.item._contacts.map((contact, index) => (
                            <ContactMetaData
                                key={index}
                                contact={this.getContactInfo(contact)}
                                scrollInView={true}
                                scrollIntoViewOptions={{block: 'center'}}
                                tabEnabled />
                        ))
                    }
                </Row>

                <ToggleBox title={gettext('Details')} isOpen={false}>
                    <Row
                        enabled={get(formProfile, 'editor.place.enabled')}
                        label={gettext('Place')}
                        value={placeText}
                    />
                    <Row
                        enabled={get(formProfile, 'editor.anpa_category.enabled')}
                        label={gettext('ANPA Category')}
                        value={categoryText}
                    />
                    {!customVocabularies.length && (
                        <Row
                            enabled={get(formProfile, 'planning.editor.subject.enabled')}
                            label={gettext('Subject')}
                            value={subjectText || ''}
                        />
                    )}
                    <CustomVocabulariesPreview customVocabularies={customVocabularies} item={item} />
                    <Row
                        enabled={get(formProfile, 'editor.definition_long.enabled')}
                        label={gettext('Long Description')}
                        value={item.definition_long || ''}
                    />
                    <Row
                        enabled={get(formProfile, 'editor.internal_note.enabled')}
                        label={gettext('Internal Note')}
                        value={item.internal_note || ''}
                    />
                    <Row
                        enabled={get(formProfile, 'editor.ednote.enabled')}
                        label={gettext('Ed Note')}
                        value={item.ednote || ''}
                    />
                </ToggleBox>
                {get(formProfile, 'editor.files.enabled') &&
                    <ToggleBox
                        title={gettext('Attached Files')}
                        isOpen={false}
                        badgeValue={get(item, 'files.length', 0) > 0 ? item.files.length : null}>
                        {get(item, 'files.length') > 0 ?
                            <ul>
                                {get(item, 'files', []).map((file, index) => (
                                    <li key={index}>
                                        <FileInput
                                            value={file}
                                            createLink={createUploadLink}
                                            readOnly={true}
                                            files={files} />
                                    </li>
                                ))}
                            </ul> :
                            <span className="sd-text__info">{gettext('No attached files added.')}</span>}
                    </ToggleBox>
                }
                {get(formProfile, 'editor.links.enabled') &&
                    <ToggleBox
                        title={gettext('External Links')}
                        isOpen={false}
                        badgeValue={get(item, 'links.length', 0) > 0 ? item.links.length : null}>
                        {get(item, 'links.length') > 0 ?
                            <ul>
                                {get(item, 'links', []).map((link, index) => (
                                    <li key={index}>
                                        <LinkInput value={link} readOnly={true} />
                                    </li>
                                ))}
                            </ul> :
                            <span className="sd-text__info">{gettext('No external links added.')}</span>}
                    </ToggleBox>
                }
                {!hideRelatedItems && item._plannings &&
                    <h3 className="side-panel__heading side-panel__heading--big">
                        {gettext('Related Planning Items')}
                    </h3>
                }
                {!hideRelatedItems && get(item, '_plannings.length') > 0 ?
                    <RelatedPlannings
                        className="related-plannings"
                        plannings={item._plannings}
                        openPlanningItem={true}
                        expandable={true}
                        users={users}
                        desks={desks}
                        timeFormat={timeFormat}
                        dateFormat={dateFormat}
                        allowEditPlanning={true} /> :
                    !hideRelatedItems &&
                    <span className="sd-text__info">{gettext('No related planning items.')}</span>
                }

            </ContentBlock>
        );
    }
}

EventPreviewContentComponent.propTypes = {
    item: PropTypes.object,
    users: PropTypes.array,
    desks: PropTypes.array,
    session: PropTypes.object,
    lockedItems: PropTypes.object,
    formProfile: PropTypes.object,
    timeFormat: PropTypes.string,
    dateFormat: PropTypes.string,
    createUploadLink: PropTypes.func,
    fetchContacts: PropTypes.func,
    streetMapUrl: PropTypes.string,
    fetchEventFiles: PropTypes.func,
    customVocabularies: PropTypes.array,
    hideRelatedItems: PropTypes.bool,
    files: PropTypes.object,
};

const mapStateToProps = (state, ownProps) => ({
    item: selectors.events.getEventPreviewRelatedDetails(state),
    session: selectors.general.session(state),
    privileges: selectors.general.privileges(state),
    users: selectors.general.users(state),
    desks: selectors.general.desks(state),
    lockedItems: selectors.locks.getLockedItems(state),
    timeFormat: selectors.config.getTimeFormat(state),
    dateFormat: selectors.config.getDateFormat(state),
    formProfile: selectors.forms.eventProfile(state),
    createUploadLink: (f) => selectors.config.getServerUrl(state) + '/upload/' + f.filemeta.media_id + '/raw',
    streetMapUrl: selectors.config.getStreetMapUrl(state),
    customVocabularies: state.customVocabularies,
    files: selectors.general.files(state),
    contacts: selectors.general.contacts(state),
});

const mapDispatchToProps = (dispatch) => ({fetchEventFiles: (event) => dispatch(eventsApi.fetchEventFiles(event))});

export const EventPreviewContent = connect(mapStateToProps, mapDispatchToProps)(EventPreviewContentComponent);
