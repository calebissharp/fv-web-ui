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
import selectn from 'selectn';
import classNames from 'classnames';

import ConfGlobal from 'conf/local.json';

import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';

import IconButton from '@material-ui/core/IconButton';

import { withStyles } from '@material-ui/core/styles'
import AVPlayArrow from '@material-ui/icons/PlayArrow';
import AVStop from '@material-ui/icons/Stop';

import ProviderHelpers from 'common/ProviderHelpers';
import UIHelpers from 'common/UIHelpers';
import IntlService from 'views/services/intl';

const WhiteAVPlayArrow = withStyles({
  root: {
    color: 'white'
  }
})(AVPlayArrow)

const WhiteAVStop = withStyles({
  root: {
    color: 'white'
  }
})(AVStop)

const intl = IntlService.instance;
export default class GridView extends Component {

    static propTypes = {
        items: PropTypes.oneOfType([
            PropTypes.array,
            PropTypes.instanceOf(List)
        ]),
        filteredItems: PropTypes.oneOfType([
            PropTypes.array,
            PropTypes.instanceOf(List)
        ]),
        action: PropTypes.func,
        cols: PropTypes.number,
        type: PropTypes.string,
        gridListTile: PropTypes.func,
        style: PropTypes.object,
        className: PropTypes.string
    };

    static defaultProps = {
        cols: 4,
        cellHeight: 160
    }

    constructor(props, context) {
        super(props, context);

        this.state = {
            nowPlaying: null
        };

        ['_handleAudioPlayback'].forEach((method => this[method] = this[method].bind(this)));
    }

    componentWillUnmount() {
        if (this.state.nowPlaying != null) {
            this.state.nowPlaying.pause();
            this.state.currentTime = 0;
        }
    }

    _handleAudioPlayback(e) {

    }

    render() {

        let items = this.props.filteredItems || this.props.items;
        let single = '';

        switch (this.props.type) {
            case 'FVWord':
                single = intl.trans('word', 'word', 'lower');
                break;

            case 'FVPhrase':
                single = intl.trans('phrase', 'phrase', 'lower');
                break;
        }

        let gridListStyle = this.props.style || {width: '100%', overflowY: 'auto', marginBottom: 24};

        return <div className={classNames('grid-view', this.props.className)}>
            <GridList
                cols={(UIHelpers.isViewSize('xs')) ? ((this.props.type === 'FVPhrase') ? 1 : 2) : this.props.cols}
                cellHeight={this.props.cellHeight}
                style={gridListStyle}
            >
                {(items).map(function (tile, i) {

                    if (this.props.gridListTile) {
                        return React.createElement(this.props.gridListTile, {key: i, tile: tile});
                    }

                    let audioIcon, audioCallback = null;
                    let definitionsHTML, literal_translationsHTML;

                    let title = selectn('properties.dc:title', tile);
                    let definitions = selectn('properties.fv:definitions', tile);
                    let literal_translations = selectn('properties.fv:literal_translation', tile);

                    let audio = selectn('contextParameters.' + single + '.related_audio[0].path', tile);
                    let imageObj = selectn('contextParameters.' + single + '.related_pictures[0]', tile);

                    if (audio) {

                        const stateFunc = function (state) {
                            this.setState(state);
                        }.bind(this);

                        audioIcon = (decodeURIComponent(selectn('src', this.state.nowPlaying)) !== ConfGlobal.baseURL + audio) ?
                            <WhiteAVPlayArrow /> : <WhiteAVStop />;
                        audioCallback = (decodeURIComponent(selectn('src', this.state.nowPlaying)) !== ConfGlobal.baseURL + audio) ? UIHelpers.playAudio.bind(this, this.state, stateFunc, ConfGlobal.baseURL + audio) : UIHelpers.stopAudio.bind(this, this.state, stateFunc);
                    }

                    if (definitions && definitions.length > 0) {
                        definitionsHTML = definitions.map(function (definition, key) {
                            return <span key={key}
                                         style={{whiteSpace: 'initial'}}>{selectn('translation', definition)}</span>;
                        })
                    }

                    if (literal_translations && literal_translations.length > 0) {
                        literal_translationsHTML = literal_translations.map(function (definition, key) {
                            return <span key={key}
                                         style={{whiteSpace: 'initial'}}>{selectn('translation', definition)}</span>;
                        });
                    }

                    let audioIconAction = <IconButton style={{marginRight: '10px'}}
                                                      
                                                      onClick={audioCallback}>{audioIcon}</IconButton>;

                    return <GridListTile
                        onClick={(this.props.action) ? this.props.action.bind(this, tile.uid, tile) : audioCallback}
                        key={i}
                    ><img src={UIHelpers.getThumbnail(imageObj, 'Small')} alt={title}/>
                        <GridListTileBar
                            title={title}
                            style={{ backgroundColor: 'rgba(180, 0, 0, 0.75)' }}
                            actionPosition="right"
                            actionIcon={(this.props.action) ? audioIconAction : audioIcon}
                            subtitle={definitionsHTML || literal_translationsHTML}
                        />  
                    </GridListTile>
                }.bind(this))}
            </GridList>
        </div>;
    }
}
