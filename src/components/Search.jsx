import React, {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';

import camelCase from 'lodash/camelCase';
import { useDispatch, useSelector } from 'react-redux';

import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon, SearchField } from '@edx/paragon';
import { Search as SearchIcon } from '@edx/paragon/icons';

import { useCurrentPage } from '../discussions/data/hooks';
import { setUsernameSearch } from '../discussions/learners/data';
import { setSearchQuery } from '../discussions/posts/data';
import postsMessages from '../discussions/posts/post-actions-bar/messages';
import { setFilter as setTopicFilter } from '../discussions/topics/data/slices';

const Search = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const page = useCurrentPage();
  const postSearch = useSelector(({ threads }) => threads.filters.search);
  const topicSearch = useSelector(({ topics }) => topics.filter);
  const learnerSearch = useSelector(({ learners }) => learners.usernameSearch);
  const isPostSearch = ['posts', 'my-posts'].includes(page);
  const isTopicSearch = 'topics'.includes(page);
  const [searchValue, setSearchValue] = useState('');
  const previousSearchValueRef = useRef('');

  const currentValue = useMemo(() => {
    if (isPostSearch) {
      return postSearch;
    } if (isTopicSearch) {
      return topicSearch;
    }
    return learnerSearch;
  }, [postSearch, topicSearch, learnerSearch]);

  const onClear = useCallback(() => {
    dispatch(setSearchQuery(''));
    dispatch(setTopicFilter(''));
    dispatch(setUsernameSearch(''));
    previousSearchValueRef.current = '';
  }, [previousSearchValueRef]);

  const onChange = useCallback((query) => {
    setSearchValue(query);
  }, []);

  const onSubmit = useCallback((query) => {
    if (query === '' || query === previousSearchValueRef.current) {
      return;
    }

    if (isPostSearch) {
      dispatch(setSearchQuery(query));
    } else if (page === 'topics') {
      dispatch(setTopicFilter(query));
    } else if (page === 'learners') {
      dispatch(setUsernameSearch(query));
    }
    previousSearchValueRef.current = query;
  }, [page, searchValue, previousSearchValueRef]);

  const handleIconClick = useCallback((e) => {
    e.preventDefault();
    onSubmit(searchValue);
  }, [searchValue]);

  useEffect(() => onClear(), [page]);

  return (
    <SearchField.Advanced
      onClear={onClear}
      onChange={onChange}
      onSubmit={onSubmit}
      value={currentValue}
    >
      <SearchField.Label />
      <SearchField.Input
        style={{ paddingRight: '1rem' }}
        placeholder={intl.formatMessage(postsMessages.search, { page: camelCase(page) })}
      />
      <span className="py-auto px-2.5 pointer-cursor-hover">
        <Icon
          src={SearchIcon}
          onClick={handleIconClick}
          data-testid="search-icon"
        />
      </span>
    </SearchField.Advanced>
  );
};

export default React.memo(Search);
