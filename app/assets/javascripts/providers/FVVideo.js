// Middleware
import thunk from 'redux-thunk';

// Operations
import DirectoryOperations from 'operations/DirectoryOperations';
import DocumentOperations from 'operations/DocumentOperations';

const DISMISS_ERROR = 'DISMISS_ERROR';

/**
* Multiple Video Actions
*/
const FV_VIDEOS_FETCH_START = "FV_VIDEOS_FETCH_START";
const FV_VIDEOS_FETCH_SUCCESS = "FV_VIDEOS_FETCH_SUCCESS";
const FV_VIDEOS_FETCH_ERROR = "FV_VIDEOS_FETCH_ERROR";

const FV_VIDEOS_UPDATE_START = "FV_VIDEOS_UPDATE_START";
const FV_VIDEOS_UPDATE_SUCCESS = "FV_VIDEOS_UPDATE_SUCCESS";
const FV_VIDEOS_UPDATE_ERROR = "FV_VIDEOS_UPDATE_ERROR";

const FV_VIDEOS_CREATE_START = "FV_VIDEOS_CREATE_START";
const FV_VIDEOS_CREATE_SUCCESS = "FV_VIDEOS_CREATE_SUCCESS";
const FV_VIDEOS_CREATE_ERROR = "FV_VIDEOS_CREATE_ERROR";

const FV_VIDEOS_DELETE_START = "FV_VIDEOS_DELETE_START";
const FV_VIDEOS_DELETE_SUCCESS = "FV_VIDEOS_DELETE_SUCCESS";
const FV_VIDEOS_DELETE_ERROR = "FV_VIDEOS_DELETE_ERROR";

/**
* Single Video Actions
*/
const FV_VIDEO_FETCH_START = "FV_VIDEO_FETCH_START";
const FV_VIDEO_FETCH_SUCCESS = "FV_VIDEO_FETCH_SUCCESS";
const FV_VIDEO_FETCH_ERROR = "FV_VIDEO_FETCH_ERROR";

const FV_VIDEOS_SHARED_FETCH_START = "FV_VIDEOS_SHARED_FETCH_START";
const FV_VIDEOS_SHARED_FETCH_SUCCESS = "FV_VIDEOS_SHARED_FETCH_SUCCESS";
const FV_VIDEOS_SHARED_FETCH_ERROR = "FV_VIDEOS_SHARED_FETCH_ERROR";

const FV_VIDEO_FETCH_STATS_START = "FV_VIDEO_FETCH_STATS_START";
const FV_VIDEO_FETCH_STATS_SUCCESS = "FV_VIDEO_FETCH_STATS_SUCCESS";
const FV_VIDEO_FETCH_STATS_ERROR = "FV_VIDEO_FETCH_STATS_ERROR";

const FV_VIDEO_UPLOAD_START = "FV_VIDEO_UPLOAD_START";
const FV_VIDEO_UPLOAD_SUCCESS = "FV_VIDEO_UPLOAD_SUCCESS";
const FV_VIDEO_UPLOAD_ERROR = "FV_VIDEO_UPLOAD_ERROR";

const FV_VIDEO_UPDATE_START = "FV_VIDEO_UPDATE_START";
const FV_VIDEO_UPDATE_SUCCESS = "FV_VIDEO_UPDATE_SUCCESS";
const FV_VIDEO_UPDATE_ERROR = "FV_VIDEO_UPDATE_ERROR";

const FV_VIDEO_CREATE_START = "FV_VIDEO_CREATE_START";
const FV_VIDEO_CREATE_SUCCESS = "FV_VIDEO_CREATE_SUCCESS";
const FV_VIDEO_CREATE_ERROR = "FV_VIDEO_CREATE_ERROR";

const FV_VIDEO_DELETE_START = "FV_VIDEO_DELETE_START";
const FV_VIDEO_DELETE_SUCCESS = "FV_VIDEO_DELETE_SUCCESS";
const FV_VIDEO_DELETE_ERROR = "FV_VIDEO_DELETE_ERROR";


const createVideo = function createVideo(parentDoc, docParams, file) {
  return function (dispatch) {

    dispatch( { type: FV_VIDEO_CREATE_START, document: docParams } );

    return DocumentOperations.createDocumentWithBlob(parentDoc, docParams, file)
      .then((response) => {
        dispatch( { type: FV_VIDEO_CREATE_SUCCESS, document: response} );
      }).catch((error) => {
          dispatch( { type: FV_VIDEO_CREATE_ERROR, error: error } )
    });
  }
};


const updateVideo = function updateVideo(newDoc, field) {
  return function (dispatch) {

    dispatch( { type: FV_VIDEO_UPDATE_START, document: newDoc, field: field } );

    return DocumentOperations.updateDocument(newDoc)
      .then((response) => {
        dispatch( { type: FV_VIDEO_UPDATE_SUCCESS, document: response, field: field} );
      }).catch((error) => {
          dispatch( { type: FV_VIDEO_UPDATE_ERROR, error: error, field: field } )
    });
  }
};

const fetchSharedVideos = function fetchSharedVideos(page_provider, headers = {}, params = {}) {
  return function (dispatch) {

    dispatch( { type: FV_VIDEOS_SHARED_FETCH_START } );

    return DirectoryOperations.getDocumentsViaPageProvider(page_provider, 'FVVideo', headers, params)
    .then((response) => {
      dispatch( { type: FV_VIDEOS_SHARED_FETCH_SUCCESS, documents: response } )
    }).catch((error) => {
        dispatch( { type: FV_VIDEOS_SHARED_FETCH_ERROR, error: error } )
    });
  }
};

/*cosnt fetchVideoAndStats = function fetchVideoWithStats(path) {
	  return dispatch => Promise.all([
	    dispatch(fetchVideo(path)),
        dispatch(fetchVideoStats())
      ]);
}*/

const fetchVideo = function fetchVideo(pathOrId) {
  return function (dispatch) {

    dispatch( { type: FV_VIDEO_FETCH_START } );

    return DocumentOperations.getDocument(pathOrId, 'FVVideo', { headers: { 'X-NXenrichers.document': 'ancestry' } })
    .then((response) => {
      dispatch( { type: FV_VIDEO_FETCH_SUCCESS, document: response } )
    }).catch((error) => {
        dispatch( { type: FV_VIDEO_FETCH_ERROR, error: error } )
    });
    
    
  }
};

const fetchVideoStats = function fetchVideoStats(dialectId) {
  return function (dispatch) {

  dispatch( { type: FV_VIDEO_FETCH_STATS_START } );

  return DocumentOperations.getVideoStats(dialectId)
	.then((response) => {
	  dispatch( { type: FV_VIDEO_FETCH_STATS_SUCCESS, document: response } )
	  }).catch((error) => {
	        dispatch( { type: FV_VIDEO_FETCH_STATS_ERROR, error: error } )
	  });
	}
};

const actions = { fetchSharedVideos, createVideo, fetchVideo, updateVideo, fetchVideoStats };

const reducers = {
  computeSharedVideos(state = { isFetching: false, response: { get: function() { return ''; } }, success: false }, action) {
    switch (action.type) {
      case FV_VIDEOS_SHARED_FETCH_START:
        return Object.assign({}, state, { isFetching: true });
      break;

      // Send modified document to UI without access REST end-point
      case FV_VIDEOS_SHARED_FETCH_SUCCESS:
        return Object.assign({}, state, { response: action.documents, isFetching: false, success: true });
      break;

      // Send modified document to UI without access REST end-point
      case FV_VIDEOS_SHARED_FETCH_ERROR:
        return Object.assign({}, state, { isFetching: false, isError: true, error: action.error, errorDismissed: (action.type === DISMISS_ERROR) ? true: false });
      break;

      default: 
        return Object.assign({}, state, { isFetching: false });
      break;
    }
  },
  computeVideo(state = { isFetching: false, response: {get: function() { return ''; }}, success: false }, action) {
    switch (action.type) {
      case FV_VIDEO_FETCH_START:
      case FV_VIDEO_UPDATE_START:
        return Object.assign({}, state, { isFetching: true, success: false });
      break;

      // Send modified document to UI without access REST end-point
      case FV_VIDEO_FETCH_SUCCESS:
      case FV_VIDEO_UPDATE_SUCCESS:
        return Object.assign({}, state, { response: action.document, isFetching: false, success: true });
      break;

      // Send modified document to UI without access REST end-point
      case FV_VIDEO_FETCH_ERROR:
      case FV_VIDEO_UPDATE_ERROR:
      case DISMISS_ERROR:
        return Object.assign({}, state, { isFetching: false, isError: true, error: action.error, errorDismissed: (action.type === DISMISS_ERROR) ? true: false });
      break;

      default: 
        return Object.assign({}, state, { isFetching: false });
      break;
    }
  },
  computeCreateVideo(state = { isFetching: false, response: {get: function() { return ''; }}, success: false }, action) {
    switch (action.type) {
      case FV_VIDEO_CREATE_START:
        return Object.assign({}, state, { isFetching: true, success: false });
      break;

      // Send modified document to UI without access REST end-point
      case FV_VIDEO_CREATE_SUCCESS:
        return Object.assign({}, state, { response: action.document, isFetching: false, success: true });
      break;

      // Send modified document to UI without access REST end-point
      case FV_VIDEO_CREATE_ERROR:
        return Object.assign({}, state, { isFetching: false, isError: true, error: action.error, errorDismissed: (action.type === DISMISS_ERROR) ? true: false });
      break;

      default: 
        return Object.assign({}, state, { isFetching: false });
      break;
    }
  },
  computeVideoStats(state = { isFetching: false, response: {get: function() { return ''; }}, success: false }, action) {
    switch (action.type) {
      case FV_VIDEO_FETCH_STATS_START:
        return Object.assign({}, state, { isFetching: true, success: false });
      break;

      case FV_VIDEO_FETCH_STATS_SUCCESS:
        return Object.assign({}, state, { response: action.document, isFetching: false, success: true });
      break;

      case FV_VIDEO_FETCH_STATS_ERROR:
        return Object.assign({}, state, { isFetching: false, isError: true, error: action.error});
      break;

      default: 
        return Object.assign({}, state, { isFetching: false });
      break;
    }
  }  
};

const middleware = [thunk];

export default { actions, reducers, middleware };