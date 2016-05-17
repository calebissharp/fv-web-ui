import RESTActions from './rest-actions'
import RESTReducers from './rest-reducers'

// Middleware
import thunk from 'redux-thunk';

// Operations
import DirectoryOperations from 'operations/DirectoryOperations';
import DocumentOperations from 'operations/DocumentOperations';

const DISMISS_ERROR = 'DISMISS_ERROR';

/**
* Multiple Word Actions
*/
const FV_WORDS_FETCH_START = "FV_WORDS_FETCH_START";
const FV_WORDS_FETCH_SUCCESS = "FV_WORDS_FETCH_SUCCESS";
const FV_WORDS_FETCH_ERROR = "FV_WORDS_FETCH_ERROR";

const FV_WORDS_UPDATE_START = "FV_WORDS_UPDATE_START";
const FV_WORDS_UPDATE_SUCCESS = "FV_WORDS_UPDATE_SUCCESS";
const FV_WORDS_UPDATE_ERROR = "FV_WORDS_UPDATE_ERROR";

const FV_WORDS_CREATE_START = "FV_WORDS_CREATE_START";
const FV_WORDS_CREATE_SUCCESS = "FV_WORDS_CREATE_SUCCESS";
const FV_WORDS_CREATE_ERROR = "FV_WORDS_CREATE_ERROR";

const FV_WORDS_DELETE_START = "FV_WORDS_DELETE_START";
const FV_WORDS_DELETE_SUCCESS = "FV_WORDS_DELETE_SUCCESS";
const FV_WORDS_DELETE_ERROR = "FV_WORDS_DELETE_ERROR";

const FV_WORDS_SHARED_FETCH_START = "FV_WORDS_SHARED_FETCH_START";
const FV_WORDS_SHARED_FETCH_SUCCESS = "FV_WORDS_SHARED_FETCH_SUCCESS";
const FV_WORDS_SHARED_FETCH_ERROR = "FV_WORDS_SHARED_FETCH_ERROR";

/**
* Single Word Actions
*/
const FV_WORD_FETCH_START = "FV_WORD_FETCH_START";
const FV_WORD_FETCH_SUCCESS = "FV_WORD_FETCH_SUCCESS";
const FV_WORD_FETCH_ERROR = "FV_WORD_FETCH_ERROR";

const FV_WORD_FETCH_ALL_START = "FV_WORD_FETCH_ALL_START";
const FV_WORD_FETCH_ALL_SUCCESS = "FV_WORD_FETCH_ALL_SUCCESS";
const FV_WORD_FETCH_ALL_ERROR = "FV_WORD_FETCH_ALL_ERROR";

const FV_WORD_UPDATE_START = "FV_WORD_UPDATE_START";
const FV_WORD_UPDATE_SUCCESS = "FV_WORD_UPDATE_SUCCESS";
const FV_WORD_UPDATE_ERROR = "FV_WORD_UPDATE_ERROR";

const FV_WORD_CREATE_START = "FV_WORD_CREATE_START";
const FV_WORD_CREATE_SUCCESS = "FV_WORD_CREATE_SUCCESS";
const FV_WORD_CREATE_ERROR = "FV_WORD_CREATE_ERROR";

const FV_WORD_DELETE_START = "FV_WORD_DELETE_START";
const FV_WORD_DELETE_SUCCESS = "FV_WORD_DELETE_SUCCESS";
const FV_WORD_DELETE_ERROR = "FV_WORD_DELETE_ERROR";

const fetchWord = RESTActions.fetch('FV_WORD', 'FVWord', { headers: { 'X-NXenrichers.document': 'ancestry,word' } });
const createWord = RESTActions.create('FV_WORD', 'FVWord', { headers: { 'X-NXenrichers.document': 'ancestry,word' } });
const updateWord = RESTActions.update('FV_WORD', 'FVWord', { headers: { 'X-NXenrichers.document': 'ancestry,word' } });
const deleteWord = RESTActions.delete('FV_WORD', 'FVWord', {});

const publishWord = RESTActions.execute('FV_WORD_PUBLISH', 'FVPublish', { headers: { 'X-NXenrichers.document': 'ancestry,word' } });
const unpublishWord = RESTActions.execute('FV_WORD_UNPUBLISH', 'FVUnpublishDialect', { headers: { 'X-NXenrichers.document': 'ancestry,word' } });
const enableWord = RESTActions.execute('FV_WORD_ENABLE', 'FVEnableDocument', { headers: { 'X-NXenrichers.document': 'ancestry,word' } });
const disableWord = RESTActions.execute('FV_WORD_DISABLE', 'FVDisableDocument', { headers: { 'X-NXenrichers.document': 'ancestry,word' } });

const computeWordFetchFactory = RESTReducers.computeFetch('word');
const computeWordDeleteFactory = RESTReducers.computeDelete('delete_word');

const fetchSharedWords = function fetchSharedWords(page_provider, headers = {}, params = {}) {
  return function (dispatch) {

    dispatch( { type: FV_WORDS_SHARED_FETCH_START } );

    return DirectoryOperations.getDocumentsViaPageProvider(page_provider, 'FVWord', headers, params)
    .then((response) => {
      dispatch( { type: FV_WORDS_SHARED_FETCH_SUCCESS, documents: response } )
    }).catch((error) => {
        dispatch( { type: FV_WORDS_SHARED_FETCH_ERROR, error: error } )
    });
  }
};

const fetchWordsAll = function fetchWordsAll(path, type) {
  return function (dispatch) {

    dispatch( { type: FV_WORD_FETCH_ALL_START } );

    return DirectoryOperations.getDocumentByPath2(path, 'FVWord', '', { headers: { 'X-NXenrichers.document': 'ancestry' } })
    .then((response) => {
      dispatch( { type: FV_WORD_FETCH_ALL_SUCCESS, documents: response } )
    }).catch((error) => {
        dispatch( { type: FV_WORD_FETCH_ALL_ERROR, error: error } )
    });
  }
};

const fetchWordsInPath = function fetchWordsInPath(path, queryAppend, headers = {}, params = {}) {
  return function (dispatch) {

    dispatch( { type: FV_WORDS_FETCH_START } );

    return DirectoryOperations.getDocumentByPath2(path, 'FVWord', queryAppend, {headers: headers}, params)
    .then((response) => {
      dispatch( { type: FV_WORDS_FETCH_SUCCESS, documents: response } )
    }).catch((error) => {
        dispatch( { type: FV_WORDS_FETCH_ERROR, error: error } )
    });
  }
};

const actions = { fetchSharedWords, fetchWordsInPath, fetchWord, createWord, deleteWord, fetchWordsAll, updateWord, publishWord, unpublishWord, enableWord, disableWord };

const reducers = {
  computeSharedWords(state = { isFetching: false, response: { get: function() { return ''; } }, success: false }, action) {
    switch (action.type) {
      case FV_WORDS_SHARED_FETCH_START:
        return Object.assign({}, state, { isFetching: true });
      break;

      // Send modified document to UI without access REST end-point
      case FV_WORDS_SHARED_FETCH_SUCCESS:
        return Object.assign({}, state, { response: action.documents, isFetching: false, success: true });
      break;

      // Send modified document to UI without access REST end-point
      case FV_WORDS_SHARED_FETCH_ERROR:
        return Object.assign({}, state, { isFetching: false, isError: true, error: action.error, errorDismissed: (action.type === DISMISS_ERROR) ? true: false });
      break;

      default: 
        return Object.assign({}, state, { isFetching: false });
      break;
    }
  },
  computeWordsInPath(state = { isFetching: false, response: { get: function() { return ''; } }, success: false }, action) {
    switch (action.type) {
      case FV_WORDS_FETCH_START:
        return Object.assign({}, state, { isFetching: true });
      break;

      // Send modified document to UI without access REST end-point
      case FV_WORDS_FETCH_SUCCESS:
        return Object.assign({}, state, { response: action.documents, isFetching: false, success: true });
      break;

      // Send modified document to UI without access REST end-point
      case FV_WORDS_FETCH_ERROR:
      case DISMISS_ERROR:
        return Object.assign({}, state, { isFetching: false, isError: true, error: action.error, errorDismissed: (action.type === DISMISS_ERROR) ? true: false });
      break;

      default: 
        return Object.assign({}, state, { isFetching: false });
      break;
    }
  },
  computeWord: computeWordFetchFactory.computeWord,
  computeDeleteWord: computeWordDeleteFactory.computeDeleteWord,
  computeWordsAll(state = { isFetching: false, response: {get: function() { return ''; }}, success: false }, action) {
    switch (action.type) {
      case FV_WORD_FETCH_ALL_START:
        return Object.assign({}, state, { isFetching: true, success: false });
      break;

      case FV_WORD_FETCH_ALL_SUCCESS:
        return Object.assign({}, state, { response: action.documents, isFetching: false, success: true });
      break;

      case FV_WORD_FETCH_ALL_ERROR:
      case DISMISS_ERROR:
        return Object.assign({}, state, { isFetching: false, isError: true, error: action.error, errorDismissed: (action.type === DISMISS_ERROR) ? true: false });
      break;

      default: 
        return Object.assign({}, state, { isFetching: false });
      break;
    }
  }
};

const middleware = [thunk];

export default { actions, reducers, middleware };