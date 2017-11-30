import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { OrderedMap } from 'immutable';
import { connect } from 'react-redux';
import {
  loadUnpublishedEntries,
  updateUnpublishedEntryStatus,
  publishUnpublishedEntry,
  deleteUnpublishedEntry 
} from 'Actions/editorialWorkflow';
import { selectUnpublishedEntriesByStatus } from 'Reducers';
import { EDITORIAL_WORKFLOW, status } from 'Constants/publishModes';
import { Loader } from 'UI';
import WorkflowList from './WorkflowList';

class Workflow extends Component {
  static propTypes = {
    collections: ImmutablePropTypes.orderedMap,
    isEditorialWorkflow: PropTypes.bool.isRequired,
    isFetching: PropTypes.bool,
    unpublishedEntries: ImmutablePropTypes.map,
    loadUnpublishedEntries: PropTypes.func.isRequired,
    updateUnpublishedEntryStatus: PropTypes.func.isRequired,
    publishUnpublishedEntry: PropTypes.func.isRequired,
    deleteUnpublishedEntry: PropTypes.func.isRequired,
  };

  componentDidMount() {
    const { loadUnpublishedEntries, isEditorialWorkflow, collections } = this.props;
    if (isEditorialWorkflow) {
      loadUnpublishedEntries(collections);
    }
  }

  render() {
    const { isEditorialWorkflow, isFetching, unpublishedEntries, updateUnpublishedEntryStatus, publishUnpublishedEntry, deleteUnpublishedEntry } = this.props;
    if (!isEditorialWorkflow) return null;
    if (isFetching) return <Loader active>Loading Editorial Workflow Entries</Loader>;

    return (
      <WorkflowList
        entries={unpublishedEntries}
        handleChangeStatus={updateUnpublishedEntryStatus}
        handlePublish={publishUnpublishedEntry}
        handleDelete={deleteUnpublishedEntry}
      />
    );
  }
}

function mapStateToProps(state) {
  const { collections } = state;
  const isEditorialWorkflow = (state.config.get('publish_mode') === EDITORIAL_WORKFLOW);
  const returnObj = { collections, isEditorialWorkflow };

  if (isEditorialWorkflow) {
    returnObj.isFetching = state.editorialWorkflow.getIn(['pages', 'isFetching'], false);

    /*
     * Generates an ordered Map of the available status as keys.
     * Each key containing a Sequence of available unpubhlished entries
     * Eg.: OrderedMap{'draft':Seq(), 'pending_review':Seq(), 'pending_publish':Seq()}
     */
    returnObj.unpublishedEntries = status.reduce((acc, currStatus) => (
      acc.set(currStatus, selectUnpublishedEntriesByStatus(state, currStatus))
    ), OrderedMap());
  }
  return returnObj;
}

export default connect(mapStateToProps, {
  loadUnpublishedEntries,
  updateUnpublishedEntryStatus,
  publishUnpublishedEntry,
  deleteUnpublishedEntry,
})(Workflow);
