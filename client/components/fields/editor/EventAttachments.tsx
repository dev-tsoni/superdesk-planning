import * as React from 'react';
import {connect} from 'react-redux';
import {get} from 'lodash';

import {IEditorFieldProps, IFile} from '../../../interfaces';
import {superdeskApi} from '../../../superdeskApi';

import * as selectors from '../../../selectors';

import {Row, FileInput} from '../../UI/Form';

import {getFileDownloadURL} from '../../../utils';

interface IProps extends IEditorFieldProps{
    files: Array<IFile>;
    uploadFiles(files: Array<Array<File>>): Promise<Array<IFile>>;
    removeFile(file: IFile): Promise<void>;
}

interface IState {
    uploading: boolean;
}

const mapStateToProps = (state) => ({
    files: selectors.general.files(state),
});

class EditorFieldEventAttachmentsComponent extends React.Component<IProps, IState> {
    node: React.RefObject<FileInput>;

    constructor(props) {
        super(props);

        this.state = {
            uploading: false,
        };
        this.node = React.createRef();

        this.onAddFiles = this.onAddFiles.bind(this);
        this.onRemoveFile = this.onRemoveFile.bind(this);
    }

    onAddFiles(fileList: FileList) {
        this.setState({uploading: true});
        const files = Array.from(fileList).map((file) => [file]);

        this.props.uploadFiles(files)
            .then((newFiles) => {
                this.props.onChange(
                    this.props.field ?? 'files',
                    [
                        ...this.props.item?.files ?? [],
                        ...newFiles.map((file) => file._id),
                    ]
                );
            }, () => {
                const {gettext} = superdeskApi.localization;
                const {notify} = superdeskApi.ui;

                notify.error(gettext('Failed to upload files'));
            })
            .finally(() => {
                this.setState({uploading: false});
            });
    }

    onRemoveFile(file: IFile) {
        (
            !(this.props.item.files ?? []).includes(file._id) ?
                this.props.removeFile(file) :
                Promise.resolve()
        ).then(() => {
            this.props.onChange(
                this.props.field ?? 'files',
                (this.props.item?.files ?? []).filter((f) => f !== file._id)
            );
        });
    }

    render() {
        const {gettext} = superdeskApi.localization;
        const field = this.props.field ?? 'files';
        const value = get(this.props.item, field, this.props.defaultValue ?? []);

        return (
            <Row ref={this.props.refNode}>
                <div className={this.state.uploading ? 'sd-loader' : ''}>
                    <label className="form-label">
                        {gettext('Attached Files')}
                    </label>
                    {this.state.uploading ? null : (
                        <FileInput
                            ref={this.node}
                            field={field}
                            value={value}
                            files={this.props.files}
                            createLink={getFileDownloadURL}
                            onAddFiles={this.onAddFiles}
                            onRemoveFile={this.onRemoveFile}
                            readOnly={this.props.disabled}
                        />
                    )}
                </div>
            </Row>
        );
    }
}

export const EditorFieldEventAttachments = connect(mapStateToProps)(EditorFieldEventAttachmentsComponent);
