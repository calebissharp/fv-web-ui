/*
Copyright 2016 First People's Cultural Council

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Immutable, {List, Map} from 'immutable';
import classNames from 'classnames';
import provide from 'react-redux-provide';
import selectn from 'selectn';

import ConfGlobal from 'conf/local.json';

import ProviderHelpers from 'common/ProviderHelpers';
import StringHelpers from 'common/StringHelpers';
import UIHelpers from 'common/UIHelpers';

import Preview from 'views/components/Editor/Preview';
import PromiseWrapper from 'views/components/Document/PromiseWrapper';
import MetadataPanel from 'views/pages/explore/dialect/learn/base/metadata-panel';
import MediaPanel from 'views/pages/explore/dialect/learn/base/media-panel';
import PageToolbar from 'views/pages/explore/dialect/page-toolbar';
import SubViewTranslation from 'views/pages/explore/dialect/learn/base/subview-translation';

import {Link} from 'provide-page';

//import Header from 'views/pages/explore/dialect/header';
//import PageHeader from 'views/pages/explore/dialect/page-header';

import AuthorizationFilter from 'views/components/Document/AuthorizationFilter';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';

import Avatar from '@material-ui/core/Avatar';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';

import { List as ListUI, ListItem, ListItemText } from '@material-ui/core';

import Button from '@material-ui/core/Button';

import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab'; 

import CircularProgress from '@material-ui/core/CircularProgress';

import WordListView from 'views/pages/explore/dialect/learn/words/list-view';
import PhraseListView from 'views/pages/explore/dialect/learn/phrases/list-view';

import '!style-loader!css-loader!react-image-gallery/build/image-gallery.css';
import IntlService from 'views/services/intl';

const intl = IntlService.instance;
/**
 * View word entry
 */
@provide
export default class View extends Component {

    static propTypes = {
        properties: PropTypes.object.isRequired,
        windowPath: PropTypes.string.isRequired,
        splitWindowPath: PropTypes.array.isRequired,
        pushWindowPath: PropTypes.func.isRequired,
        changeTitleParams: PropTypes.func.isRequired,
        overrideBreadcrumbs: PropTypes.func.isRequired,
        computeLogin: PropTypes.object.isRequired,
        fetchDialect2: PropTypes.func.isRequired,
        computeDialect2: PropTypes.object.isRequired,
        fetchResource: PropTypes.func.isRequired,
        computeResource: PropTypes.object.isRequired,
        publishResource: PropTypes.func.isRequired,
        askToPublishResource: PropTypes.func.isRequired,
        unpublishResource: PropTypes.func.isRequired,
        askToUnpublishResource: PropTypes.func.isRequired,
        enableResource: PropTypes.func.isRequired,
        askToEnableResource: PropTypes.func.isRequired,
        disableResource: PropTypes.func.isRequired,
        askToDisableResource: PropTypes.func.isRequired,
        routeParams: PropTypes.object.isRequired
    };

    constructor(props, context) {
        super(props, context);

        this.state = {
            showThumbnailDialog: null,
            tabValue: 0,
        };

        // Bind methods to 'this'
        ['_handleConfirmDelete', '_enableToggleAction', '_publishToggleAction', '_onNavigateRequest', '_publishChangesAction'].forEach((method => this[method] = this[method].bind(this)));
    }

    fetchData(newProps) {

        if (!this.getDialect(newProps)) {
            newProps.fetchDialect2(newProps.routeParams.dialect_path);
        }

        if (!this.getResource(newProps)) {
            newProps.fetchResource(this._getMediaPath(newProps));
        }
    }

    // Refetch data on URL change
    componentWillReceiveProps(nextProps) {

        if (nextProps.routeParams.dialect_path !== this.props.routeParams.dialect_path) {
            this.fetchData(nextProps);
        }
        else if (nextProps.routeParams.media !== this.props.routeParams.media) {
            this.fetchData(nextProps);
        }
        // else if (nextProps.computeLogin.success !== this.props.computeLogin.success) {
        //     this.fetchData(nextProps);
        // }
    }

    // Fetch data on initial render
    componentDidMount() {
        this.fetchData(this.props);
    }

    componentDidUpdate(prevProps, prevState) {
        let media = selectn('response', ProviderHelpers.getEntry(this.props.computeResource, this._getMediaPath()));
        let title = selectn('properties.dc:title', media);
        let uid = selectn('uid', media);

        if (title && selectn('pageTitleParams.media', this.props.properties) != title) {
            this.props.changeTitleParams({'media': title});
            this.props.overrideBreadcrumbs({find: uid, replace: 'pageTitleParams.media'});
        }
    }

    getResource(props = this.props) {
        return ProviderHelpers.getEntry(props.computeResource, this._getMediaPath());
    }

    getDialect(props = this.props) {
        return ProviderHelpers.getEntry(props.computeDialect2, props.routeParams.dialect_path);
    }

    _getMediaPath(props = null) {

        if (props == null) {
            props = this.props;
        }

        if (StringHelpers.isUUID(props.routeParams.media)){
            return props.routeParams.media;
        } else {
            return props.routeParams.dialect_path + '/Resources/' + StringHelpers.clean(props.routeParams.media);
        }
    }

    _getMediaRelatedField(type) {
        switch (type) {
            case 'FVAudio':
                return 'fv:related_audio';
                break;

            case 'FVVideo':
                return 'fv:related_videos';
                break;

            case 'FVPicture':
                return 'fv:related_pictures';
                break;
        }
    }

    _onNavigateRequest(path) {
        this.props.pushWindowPath(path);
    }

    _handleConfirmDelete(item, event) {
        this.props.deleteResource(item.uid);
        this.setState({deleteDialogOpen: false});
    }

    /**
     * Toggle dialect (enabled/disabled)
     */
    _enableToggleAction(toggled, workflow) {
        if (toggled) {
            if (workflow) {
                this.props.askToEnableResource(this._getMediaPath(), {
                    id: "FVEnableLanguageAsset",
                    start: "true"
                }, null, intl.trans('views.pages.explore.dialect.media.request_to_enable_success', "Request to enable resource successfully submitted!"), null);
            }
            else {
                this.props.enableResource(this._getMediaPath(), null, null, intl.trans('views.pages.explore.dialect.media.resource_enabled', "Resource enabled!"));
            }
        } else {
            if (workflow) {
                this.props.askToDisableResource(this._getMediaPath(), {
                    id: "FVDisableLanguageAsset",
                    start: "true"
                }, null, intl.trans('views.pages.explore.dialect.media.request_to_disable_success', "Request to disable resource successfully submitted!"), null);
            }
            else {
                this.props.disableResource(this._getMediaPath(), null, null, intl.trans('views.pages.explore.dialect.media.resource_disabled', "Resource disabled!"));
            }
        }
    }

    /**
     * Toggle published dialect
     */
    _publishToggleAction(toggled, workflow) {
        if (toggled) {
            if (workflow) {
                this.props.askToPublishResource(this._getMediaPath(), {
                    id: "FVPublishLanguageAsset",
                    start: "true"
                }, null, intl.trans('views.pages.explore.dialect.media.request_to_publish_success', "Request to publish resource successfully submitted!"), null);
            }
            else {
                this.props.publishResource(this._getMediaPath(), null, null, intl.trans('views.pages.explore.dialect.media.resource_published_success', "Resource published successfully!"));
            }
        } else {
            if (workflow) {
                this.props.askToUnpublishResource(this._getMediaPath(), {
                    id: "FVUnpublishLanguageAsset",
                    start: "true"
                }, null, intl.trans('views.pages.explore.dialect.media.request_to_unpublic_success', "Request to unpublish resource successfully submitted!"), null);
            }
            else {
                this.props.unpublishResource(this._getMediaPath(), null, null, intl.trans('views.pages.explore.dialect.media.resource_unpublished_success', "Resource unpublished successfully!"));
            }
        }
    }

    /**
     * Publish changes
     */
    _publishChangesAction() {
        this.props.publishResource(this._getMediaPath(), null, null, intl.trans('views.pages.explore.dialect.media.resource_published_success', "Resource published successfully!"));
    }

    render() {

        const tabItemStyles = {
            userSelect: 'none'
        }

        const computeEntities = Immutable.fromJS([{
            'id': this._getMediaPath(),
            'entity': this.props.computeResource
        }, {
            'id': this.props.routeParams.dialect_path,
            'entity': this.props.computeDialect2
        }])

        const computeResource = this.getResource();
        const computeDialect2 = this.getDialect();

        const currentAppliedFilter = new Map({currentAppliedFilter: new Map({startsWith: ' AND ' + ProviderHelpers.switchWorkspaceSectionKeys(this._getMediaRelatedField(selectn('response.type', computeResource)), this.props.routeParams.area) + ' = \'' + selectn('response.uid', computeResource) + '\''})});

        /**
         * Generate definitions body
         */
        return <PromiseWrapper computeEntities={computeEntities}>

            {(() => {
                if (this.props.routeParams.area == 'Workspaces') {

                    if (selectn('response', computeResource))
                        return <PageToolbar
                            label={intl.trans('media', 'Media', 'first')}
                            handleNavigateRequest={this._onNavigateRequest}
                            actions={['workflow', 'edit', 'publish-toggle', 'enable-toggle', 'publish']}
                            computeEntity={computeResource}
                            computePermissionEntity={computeDialect2}
                            computeLogin={this.props.computeLogin}
                            publishToggleAction={this._publishToggleAction}
                            publishChangesAction={this._publishChangesAction}
                            enableToggleAction={this._enableToggleAction}
                            {...this.props}></PageToolbar>;
                }
            })()}

            <div className="row">
                <div className="col-xs-12">
                    <div>

                        <Card>

                            <Tabs value={this.state.tabValue} onChange={(e, tabValue) => this.setState({ tabValue })}>
                                <Tab label={intl.trans('overview', 'Overview', 'first')} />
                                <Tab
                                    label={UIHelpers.isViewSize('xs') ? intl.trans('words', 'Words', 'first') : intl.trans('linked_words', 'Linked Words', 'words')}
                                    id="find_words" />
                                <Tab
                                    label={UIHelpers.isViewSize('xs') ? intl.trans('phrases', 'Phrases', 'first') : intl.trans('linked_phrases', 'Linked Phrases', 'words')}
                                    id="find_phrases" />
                            </Tabs>
                            {this.state.tabValue === 0 && (
                                <Typography component="div" style={{ padding: 8 * 3 }}>
                                    <div>
                                        <CardContent>

                                            <div className={classNames('col-md-8', 'col-xs-12')}>

                                                <Preview style={{width: 'auto'}} initiallyExpanded={true}
                                                         metadataListStyles={{maxHeight: 'initial'}}
                                                         expandedValue={selectn('response', computeResource)}
                                                         type={selectn('response.type', computeResource)}/>

                                            </div>

                                            <div className={classNames('col-md-4', 'hidden-xs')}>

                                                {(() => {

                                                    const thumbnails = selectn('response.properties.picture:views', computeResource) || [];

                                                    if (thumbnails && thumbnails.length > 0) {
                                                        return <div>
                                                            <ListUI
                                                                subheader={intl.trans('views.pages.explore.dialect.media.available_renditions', "Available Renditions")}>

                                                                {(thumbnails).map(function (thumbnail, key) {

                                                                    return <ListItem
                                                                        onClick={() => this.setState({showThumbnailDialog: thumbnail})}
                                                                        key={key}>
                                                                            <ListItemText
                                                                                primary={thumbnail.title}
                                                                                secondary={
                                                                                    <p>
                                                                                        <span style={{color: '#000'}}>{thumbnail.description}</span>
                                                                                        -- ({thumbnail.width + 'x' + thumbnail.height})
                                                                                    </p>
                                                                                } 
                                                                            />
                                                                        </ListItem>;
                                                                }.bind(this))}

                                                            </ListUI>

                                                            <Dialog
                                                                contentStyle={{
                                                                    textAlign: 'center',
                                                                    height: '500px',
                                                                    maxHeight: '500px'
                                                                }}
                                                                autoScrollBodyContent={true}
                                                                title={selectn('title', this.state.showThumbnailDialog)}
                                                                modal={false}
                                                                open={(this.state.showThumbnailDialog === null) ? false : true}
                                                                onRequestClose={() => this.setState({showThumbnailDialog: null})}>
                                                                <p><img
                                                                    src={selectn('content.data', this.state.showThumbnailDialog)}
                                                                    alt={selectn('title', this.state.showThumbnailDialog)}
                                                                    style={{maxHeight: '500px'}}/></p>
                                                                <p><input readOnly type="text"
                                                                          value={selectn('content.data', this.state.showThumbnailDialog)}
                                                                          style={{width: '100%', padding: '5px'}}/></p>
                                                                <DialogActions>
                                                                    <Button variant='flat'
                                                                        color="secondary"
                                                                        onClick={() => this.setState({showThumbnailDialog: null})}>{intl.trans('close', 'Close', 'first')}</Button>
                                                                </DialogActions>
                                                            </Dialog>
                                                        </div>;
                                                    }

                                                })()}

                                            </div>

                                        </CardContent>
                                    </div>
                                </Typography>
                            )}
                            {this.state.tabValue === 1 && (
                                <Typography component="div" style={{ padding: 8 * 3 }}>
                                    <div>
                                        <CardContent>
                                            <h2>{intl.trans('views.pages.explore.dialect.media.words_featuring', 'Words Featuring')}
                                                <strong>{selectn('response.title', computeResource)}</strong>
                                            </h2>
                                            <div className="row">
                                                <WordListView
                                                    filter={currentAppliedFilter}
                                                    routeParams={this.props.routeParams}/>
                                            </div>
                                        </CardContent>
                                    </div>
                                </Typography>
                            )}
                            {this.state.tabValue === 2 && (
                                <Typography component="div" style={{ padding: 8 * 3 }}>
                                    <div>
                                        <CardContent>
                                            <h2>{intl.trans('views.pages.explore.dialect.media.words_featuring_with', 'Words Featuring with')}
                                                <strong>{selectn('response.title', computeResource)}</strong></h2>
                                            <div className="row">
                                                <PhraseListView
                                                    filter={currentAppliedFilter}
                                                    routeParams={this.props.routeParams}/>
                                            </div>
                                        </CardContent>
                                    </div>
                                </Typography>
                            )}
                        </Card>

                    </div>
                </div>
            </div>
        </PromiseWrapper>;
    }
}