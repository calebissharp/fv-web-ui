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
import Immutable, {List, Set, Map} from 'immutable';
import classNames from 'classnames';
import provide from 'react-redux-provide';
import selectn from 'selectn';

import PromiseWrapper from 'views/components/Document/PromiseWrapper';

import ProviderHelpers from 'common/ProviderHelpers';
import NavigationHelpers from 'common/NavigationHelpers';
import UIHelpers from 'common/UIHelpers';

import AuthorizationFilter from 'views/components/Document/AuthorizationFilter';
import PageDialectLearnBase from 'views/pages/explore/dialect/learn/base';
import PhraseListView from 'views/pages/explore/dialect/learn/phrases/list-view';

import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';

import FacetFilterList from 'views/components/Browsing/facet-filter-list';

import {BrowserView, MobileView, isBrowser, isMobile} from 'react-device-detect';
import IntlService from 'views/services/intl';

const intl = IntlService.instance;

/**
 * Learn phrases
 */
@provide
export default class PageDialectLearnPhrases extends PageDialectLearnBase {

    static propTypes = {
        windowPath: PropTypes.string.isRequired,
        pushWindowPath: PropTypes.func.isRequired,
        splitWindowPath: PropTypes.array.isRequired,
        fetchDocument: PropTypes.func.isRequired,
        computeDocument: PropTypes.object.isRequired,
        computeLogin: PropTypes.object.isRequired,
        properties: PropTypes.object.isRequired,
        fetchPortal: PropTypes.func.isRequired,
        computePortal: PropTypes.object.isRequired,
        fetchCategories: PropTypes.func.isRequired,
        computeCategories: PropTypes.object.isRequired,
        overrideBreadcrumbs: PropTypes.func.isRequired,
        updatePageProperties: PropTypes.func.isRequired,
        routeParams: PropTypes.object.isRequired,
        hasPagination: PropTypes.bool
    };

    constructor(props, context) {
        super(props, context);

        let initialCategories = (props.routeParams.category) ? new Set([props.routeParams.category]) : new Set();


        let filterInfo = new Map({
            currentCategoryFilterIds: initialCategories,
            currentAppliedFilter: new Map({
                categories: (props.routeParams.category) ? ' AND ' + ProviderHelpers.switchWorkspaceSectionKeys('fv-phrase:phrase_books', props.routeParams.area) + '/* IN ("' + props.routeParams.category + '")' : ''
            })
        });

        // If no filters are applied via URL, use props
        let pagePropertiesFilterInfo = selectn([[this._getPageKey()], 'filterInfo'], props.properties.pageProperties);

        if (filterInfo.get("currentCategoryFilterIds").isEmpty() && pagePropertiesFilterInfo) {
            filterInfo = pagePropertiesFilterInfo
        }

        this.state = {
            filterInfo: filterInfo
        };

        // Bind methods to 'this'
        ['_onNavigateRequest', '_handleFacetSelected', '_handlePagePropertiesChange', '_resetURLPagination', '_getPageKey', '_getURLPageProps'].forEach((method => this[method] = this[method].bind(this)));
    }

    _getPageKey() {
        return this.props.routeParams.area + '_' + this.props.routeParams.dialect_name + '_learn_phrases';
    }

    fetchData(newProps) {
        ProviderHelpers.fetchIfMissing(newProps.routeParams.dialect_path + '/Portal', newProps.fetchPortal, newProps.computePortal);
        ProviderHelpers.fetchIfMissing(newProps.routeParams.dialect_path + '/Dictionary', newProps.fetchDocument, newProps.computeDocument);
        ProviderHelpers.fetchIfMissing('/api/v1/path/' + newProps.routeParams.dialect_path + '/Phrase Books/@children', newProps.fetchCategories, newProps.computeCategories);
    }

    render() {

        const computeEntities = Immutable.fromJS([{
            'id': this.props.routeParams.dialect_path,
            'entity': this.props.computePortal
        }, {
            'id': '/api/v1/path/' + this.props.routeParams.dialect_path + '/Phrase Books/@children',
            'entity': this.props.computeCategories
        }])

        const computeDocument = ProviderHelpers.getEntry(this.props.computeDocument, this.props.routeParams.dialect_path + '/Dictionary');
        const computePortal = ProviderHelpers.getEntry(this.props.computePortal, this.props.routeParams.dialect_path + '/Portal');
        const computePhraseBooks = ProviderHelpers.getEntry(this.props.computeCategories, '/api/v1/path/' + this.props.routeParams.dialect_path + '/Phrase Books/@children');

        let computePhraseBooksSize = selectn('response.entries.length', computePhraseBooks) || 0;

        const isKidsTheme = this.props.routeParams.theme === 'kids';

        const phraseListView = <PhraseListView controlViaURL={true} onPaginationReset={this._resetURLPagination} onPagePropertiesChange={this._handlePagePropertiesChange} filter={this.state.filterInfo} {...this._getURLPageProps()} routeParams={this.props.routeParams}/>;

        // Render kids view
        if (isKidsTheme || isMobile) {

            let pageSize = 4; // Items per Kids page

            // Mobile but not Kids
            if (!isKidsTheme && isMobile) {
                pageSize = 10; // Items per page for mobile, but not Kids
            }

            let kidsFilter = this.state.filterInfo.setIn(['currentAppliedFilter', 'kids'], ' AND fv:available_in_childrens_archive=1');

            return <PromiseWrapper renderOnError={true} computeEntities={computeEntities}>

                <div className="row">
                    <div className={classNames('col-xs-12', 'col-md-8', 'col-md-offset-2')}>
                        {React.cloneElement(phraseListView, {
                            gridListView: true,
                            gridCols: 2,
                            DEFAULT_PAGE_SIZE: pageSize,
                            filter: kidsFilter
                        })}
                    </div>
                </div>

            </PromiseWrapper>;
        }

        return <PromiseWrapper renderOnError={true} computeEntities={computeEntities}>
            <div className={classNames('row', 'row-create-wrapper')}>
                <div className={classNames('col-xs-12', 'col-md-4', 'col-md-offset-8', 'text-right')}>
                    <AuthorizationFilter hideFromSections={true} routeParams={this.props.routeParams} filter={{
                        role: ['Record', 'Approve', 'Everything'],
                        entity: selectn('response', computeDocument),
                        login: this.props.computeLogin
                    }}>
                        <Button variant='raised'
                            onClick={this._onNavigateRequest.bind(this, 'create')} color="primary">
                            {intl.trans('views.pages.explore.dialect.phrases.create_new_phrase', 'Create New Phrase', 'words')}    
                        </Button>
                    </AuthorizationFilter>
                </div>
            </div>
            <div className="row">
                <div className={classNames('col-xs-12', 'col-md-3', (computePhraseBooksSize == 0) ? 'hidden' : null)}>
                    <FacetFilterList
                        title={intl.trans('phrase_books', 'Phrase Books', 'words')}
                        appliedFilterIds={this.state.filterInfo.get('currentCategoryFilterIds')}
                        facetField={ProviderHelpers.switchWorkspaceSectionKeys('fv-phrase:phrase_books', this.props.routeParams.area)}
                        onFacetSelected={this._handleFacetSelected}
                        facets={selectn('response.entries', computePhraseBooks) || []}/>
                </div>
                <div className={classNames('col-xs-12', (computePhraseBooksSize == 0) ? 'col-md-12' : 'col-md-9')}>
                    <h1>{intl.trans('views.pages.explore.dialect.phrases.x_phrases', selectn('response.contextParameters.ancestry.dialect.dc:title', computePortal) + ' Phrases', null, [selectn('response.contextParameters.ancestry.dialect.dc:title', computePortal)])}</h1>
                    {phraseListView}
                </div>
            </div>
        </PromiseWrapper>;
    }
}