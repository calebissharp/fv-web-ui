import React, {Component, PropTypes} from 'react';
import classNames from 'classnames';
import provide from 'react-redux-provide';
import Autosuggest from 'react-autosuggest';

const theme = {
  container: 'autosuggest dropdown',
  containerOpen: 'dropdown open',
  input: 'form-control',
  suggestionsContainer: 'dropdown-menu',
  suggestion: '',
  suggestionFocused: 'active'
};

@provide
export default class AutoSuggestComponent extends Component {
  static propTypes = {
    fetchSharedAudios: PropTypes.func.isRequired,
    computeSharedAudios: PropTypes.object.isRequired,
    dialect: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired
  };


shouldRenderSuggestions(value) {
  return value.trim().length > 2;
}

getSuggestionValue(suggestion) {
    this.props.onChange(
      event, suggestion
    );
  return suggestion.title;
}

renderSuggestion(suggestion) {
  return (<a href='#'>{suggestion.title}</a>);
}

  constructor(props) {
    super(props);

    this.state = {
      value: '',
      suggestions: [],
      isLoading: false,
      selectObj: null
    };
    
    this.onChange = this.onChange.bind(this);
    this.getSuggestionValue = this.getSuggestionValue.bind(this);
    this.onSuggestionsUpdateRequested = this.onSuggestionsUpdateRequested.bind(this);
  }
  
  // BUG: this will show UID instead of title?
  componentWillReceiveProps(newProps) {
    
    if (newProps.value && newProps.value != this.state.value) {
      console.log(newProps.value);
      this.setState({
        value: newProps.value
      });
    }
  }

  loadSuggestions(value) {
    this.setState({
      isLoading: true
    });

    switch (this.props.type) {
      case 'audio':
        this.props.fetchSharedAudios('all_shared_audio', 'currentPageIndex=1&pageSize=15&queryParams=' + value + '&queryParams=' + this.props.dialect.uid, {});
      break;
    }   
  }

  onChange(event, { newValue }) {

    this.setState({
      value: newValue
    });
  }
  
  //onSuggestionSelected(event, { suggestionValue }) {
    //this.loadSuggestions(suggestionValue);
  //}
  
  onSuggestionsUpdateRequested({ value, reason }) {

    if (reason === 'type')
      this.loadSuggestions(value);
  }


  getComputeType() {
    switch (this.props.type) {
      case 'audio':
        return this.props.computeSharedAudios;
      break;
    }
  }

  render() {

    const { value, isLoading } = this.state;
    const inputProps = {
      placeholder: "Start typing for suggestions...",
      value,
      onChange: this.onChange
    };

    const status = (this.getComputeType().isFetching ? 'Loading suggestions...' : '');

    return (
      <div className="app-container">
        <Autosuggest
          theme={theme}
          suggestions={this.getComputeType().response.entries || []}
          shouldRenderSuggestions={this.shouldRenderSuggestions}
          //onSuggestionSelected={this.props.onSuggestionSelected}
          onSuggestionsUpdateRequested={this.onSuggestionsUpdateRequested}
          getSuggestionValue={this.getSuggestionValue}
          renderSuggestion={this.renderSuggestion}
          inputProps={inputProps} />
        <div className="status">
          <strong>Status:</strong> {status}
        </div>
      </div>
    );
  }
}