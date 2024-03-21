import { Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import { useEffect, useState, useContext } from 'react';
import UserService from '../../services/userService';
import RelationService from '../../services/relationService';
import Posts from '../Posts';
import Users from '../Users';
import './Social.css';
import { useSearchParams } from 'react-router-dom';
import UserContext from '../../context/userContext';
import TextSearch from '../TextSearch';
import SearchResults from '../SearchResults';

const paramKey = {
  tabOption: 'o',
  relationOption: 'r',
  page: 'page',
};

const tabOptions = {
  Posts: 'Posts',
  Users: 'Users',
};

const relationOptions = {
  Friends: 'Friends',
  Pending: 'Pending',
  Requested: 'Requested',
};

export default function Social() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get(paramKey.tabOption) || tabOptions.Posts;
  const initialRelation =
    searchParams.get(paramKey.relationOption) || relationOptions.Friends;
  const [searchText, setSearchText] = useState(searchParams.get('q') || '');
  const initialPage = parseInt(searchParams.get(paramKey.page), 10) || 1;

  const queryLimit = 10;
  const [totalResults, setTotalResults] = useState(0);

  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [tabOption, setTabOption] = useState(initialTab);
  const [relationOption, setRelationOption] = useState(initialRelation);
  const [page, setPage] = useState(initialPage);

  const { user } = useContext(UserContext);

  useEffect(() => {
    const loadContent = async () => {
      if (tabOption === tabOptions.Posts) {
        const query = {
          limit: queryLimit,
          page: page,
        };
        const response = await UserService.getConnectedPosts(query);
        setPosts(response.data);
        setTotalResults(response.totalCount);
      } else {
        const query = {
          relation: relationOption,
          limit: queryLimit,
          page: page,
        };
        const response = await RelationService.getRelations(user.id, query);
        setUsers(response.data);
        setTotalResults(response.totalCount);
      }
    };
    loadContent();
  }, [tabOption, searchText, relationOption, user.id, page]);

  // use effect to update search params
  useEffect(() => {
    const updateSearchParams = () => {
      setSearchParams(
        (params) => {
          if (searchText) {
            params.set('q', searchText);
          }
          params.set('o', tabOption);
          params.set('page', page);

          if (tabOption === tabOptions.Posts) {
            params.delete('r');
          } else {
            params.set('r', relationOption);
          }
          return params;
        },
        { replace: true },
      );
    };

    const updateSearchResults = async () => {
      if (tabOption === tabOptions.Posts) {
        const query = {
          keywords: searchText,
        };

        try {
          const response = await UserService.getConnectedPosts(query);
          setPosts(response.data);
          setTotalResults(response.totalCount || response.data.length > 0);
        } catch (error) {
          console.error('Error', error);
        }
      } else {
        const query = {
          keywords: searchText,
          relation: relationOption,
        };
        try {
          const response = await RelationService.getRelations(user.id, query);
          setUsers(response.data);
          setTotalResults(response.totalCount || response.data.length > 0);
        } catch (error) {
          console.error('Error', error);
        }
      }
    };

    const submitSearch = async () => {
      updateSearchParams();
      updateSearchResults();
    };

    submitSearch();
  }, [tabOption, relationOption, searchText, user.id, setSearchParams, page]);

  const renderTabContent = () => {
    if (tabOption === tabOptions.Posts) {
      return <Posts posts={posts} />;
    } else {
      return <Users users={users} />;
    }
  };

  const renderTabSelectors = () => {
    return (
      <div className="selectors-wrapper">
        <FormControl>
          <InputLabel id="social-option-label">Social</InputLabel>
          <Select
            labelId="social-option-label"
            value={tabOption}
            label="Social"
            onChange={(e) => {
              setTabOption(e.target.value);
              setPage(1);
            }}
          >
            {Object.keys(tabOptions).map((option, index) => (
              <MenuItem key={index} value={tabOptions[option]}>
                {tabOptions[option]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {tabOption === tabOptions.Users && (
          <FormControl>
            <InputLabel id="status-selector-label">Relation Status</InputLabel>
            <Select
              labelId="status-selector-label"
              label="Relation Status"
              value={relationOption}
              onChange={(e) => {
                setRelationOption(e.target.value);
                setPage(1);
              }}
              style={{ minWidth: '150px', textAlign: 'left' }}
            >
              {Object.keys(relationOptions).map((option, index) => (
                <MenuItem key={index} value={relationOptions[option]}>
                  {relationOptions[option]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </div>
    );
  };

  return (
    <div className="page-content">
      <div
        className="sidebar"
        style={{
          textAlign: 'left',
          width: 'auto',
          maxWidth: '200px',
        }}
      >
        {renderTabSelectors()}
      </div>
      <div>
        <TextSearch.SearchBar
          searchText={searchText}
          onSearchSubmit={setSearchText}
        />
        {renderTabContent()}
        <div
          style={{
            display: 'flex',
            color: 'violet',
            justifyContent: 'center',
            marginTop: '20px',
            marginRight: '150px',
          }}
        >
          <SearchResults
            page={page}
            totalResults={totalResults}
            queryLimit={queryLimit}
            setPage={setPage}
          />
        </div>
      </div>
    </div>
  );
}
