import axios from 'axios';
import { useEffect, useMemo, useReducer } from 'react';
import { useParams } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroller';

import CustomAccordion from './CustomAccordion';
import CategoryCard from './Category-Card';
import { categoryUrl } from '../../Helpers/CategoryUrl';
import useTitle from '../../Hooks/useTitle';

import styles from './Categories.module.scss';
import { Button, Divider, FormControl, MenuItem, Select } from '@mui/material';
import { API, DISCOVER_URL, GENRES } from '../../Constants';
import { sortOptions } from '../../Helpers/SortOptions';
import { serializeObject } from '../../Helpers/ObjectToUrl';
import { Checkbox } from '../../Components/Checkbox/Checkbox';

const Categories = () => {
  const params = useParams();
  const { type, category } = params;
  const { data, title } = categoryUrl(type, category);

  useTitle(`${title} — The Movie Database (TMDB)`);

  const initialState = {
    categories: {
      results: [],
      page: 1,
      total_pages: 1,
    },
    hasMore: false,
    genreFilterArr: [],
    allGenreList: [],
    options: data,
  };

  const [state, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case 'set_categories':
        if (action.payload.page === 1) {
          return {
            ...state,
            categories: action.payload,
          };
        } else {
          return {
            ...state,
            categories: {
              results: [...state.categories.results, ...action.payload.results],
              page: action.payload.page,
              total_pages: action.payload.total_pages,
            },
          };
        }
      case 'set_hasMore':
        return {
          ...state,
          hasMore: action.payload,
        };
      case 'set_genreFilterArr':
        return {
          ...state,
          genreFilterArr: action.payload,
        };
      case 'set_allGenreList':
        return {
          ...state,
          allGenreList: action.payload,
        };
      case 'set_options':
        return {
          ...state,
          options: action.payload,
        };
      case 'set_sort':
        return {
          ...state,
          options: {
            ...state.options,
            sort_by: action.payload,
          },
        };
      default:
        return state;
    }
  }, initialState);

  const defaultUrl = useMemo(() => serializeObject(data), [data]);
  const url = useMemo(() => serializeObject(state.options), [state.options]);

  const handleLoadMore = async (page) => {
    try {
      const options = page === 1 ? defaultUrl : url;
      console.log('LOAD MORE URL:::', url);
      const response = await axios.get(
        `${DISCOVER_URL}/${type}?api_key=${API}&${options}&page=${page}`
      );
      dispatch({ type: 'set_categories', payload: response.data });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    dispatch({ type: 'set_hasMore', payload: false });
    dispatch({
      type: 'set_options',
      payload: data,
    });
    handleLoadMore(1);
  }, [type, category, data]);

  const handleSearch = async () => {
    try {
      const res = await axios.get(
        `${DISCOVER_URL}/${type}?api_key=${API}&${url}`
      );
      dispatch({ type: 'set_categories', payload: res.data });
    } catch (error) {
      console.log(error);
    }
  };

  const handleChangeSort = (event) => {
    dispatch({
      type: 'set_options',
      payload: { ...state.options, sort_by: event.target.value },
    });
  };

  const toggleGenre = (genre) => {
    const newGenreFilterArr = state.genreFilterArr.includes(genre)
      ? state.genreFilterArr.filter((item) => item !== genre)
      : [...state.genreFilterArr, genre];
    dispatch({ type: 'set_genreFilterArr', payload: newGenreFilterArr });
    dispatch({
      type: 'set_options',
      payload: { ...state.options, with_genres: newGenreFilterArr.join(',') },
    });
  };

  useEffect(() => {
    const fetchGenre = async () => {
      try {
        const res = await axios.get(`${GENRES}/${type}/list?api_key=${API}`);
        dispatch({ type: 'set_allGenreList', payload: res.data.genres });
      } catch (error) {
        console.log(error);
      }
    };
    fetchGenre();
  }, [type]);

  useEffect(() => {
    if (state.categories.page === state.categories.total_pages) {
      dispatch({ type: 'set_hasMore', payload: false });
    }
  }, [state.categories.page, state.categories.total_pages]);

  return (
    <>
      <section className={styles.inner_content}>
        <div className={styles.media}>
          <div className={styles.column_wrapper}>
            <div className={styles.content_wrapper}>
              <div className={styles.title}>
                <h2>{title}</h2>
              </div>
              <div className={styles.content}>
                <div className={styles.filter_container}>
                  <CustomAccordion title='Sort' border>
                    <h3>Sort Results By</h3>
                    <FormControl fullWidth>
                      <Select
                        value={state.options.sort_by}
                        onChange={handleChangeSort}
                        className={styles['custom-select']}
                      >
                        {sortOptions.map((item) => (
                          <MenuItem
                            key={item.value}
                            value={item.value}
                            className={styles['menu-item']}
                          >
                            {item.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </CustomAccordion>
                  <CustomAccordion title='Filters' border>
                    <h3>Availabilities</h3>
                    <Checkbox value='all' isChecked={true}>Search all availabilities?</Checkbox>
                    <Divider />
                    <h3>Genres</h3>
                    <ul className={styles.multi_select}>
                      {state.allGenreList.map((genre) => (
                        <li
                          key={genre.id}
                          className={
                            state.genreFilterArr.includes(genre.id)
                              ? styles.active
                              : ''
                          }
                          onClick={() => toggleGenre(genre.id)}
                        >
                          {genre.name}
                        </li>
                      ))}
                    </ul>
                  </CustomAccordion>
                  <Button
                    variant='contained'
                    fullWidth
                    sx={{
                      backgroundColor: '#01b4e4',
                      height: '44px',
                      borderRadius: '20px',
                      fontSize: '1.2em',
                      fontWeight: '600',
                      fontFamily: 'inherit',
                      mt: '7px',
                      lineHeight: '1',
                      '&:hover': {
                        backgroundColor: '#032541',
                      },
                    }}
                    onClick={handleSearch}
                  >
                    Search
                  </Button>
                </div>
                <div>
                  <div className={styles.right_media_container}>
                    <section className={styles.panel_results}>
                      {state.categories && state.categories.results.length > 0 && (
                        <div className={styles.media_item_results}>
                          <InfiniteScroll
                            className={styles.page_wrapper}
                            pageStart={1}
                            loadMore={handleLoadMore}
                            hasMore={state.hasMore}
                          >
                            {state.categories.results.map((data) => (
                              <CategoryCard key={data.id} {...{ data, type }} />
                            ))}
                          </InfiniteScroll>
                          {state.categories.page <=
                            state.categories.total_pages && (
                            <Button
                              className={styles.load_more}
                              variant='contained'
                              fullWidth
                              onClick={() =>
                                dispatch({ type: 'set_hasMore', payload: true })
                              }
                            >
                              Load More
                            </Button>
                          )}
                        </div>
                      )}
                      {state.categories &&
                        state.categories.results.length === 0 && (
                          <span>
                            No items were found that match your query.
                          </span>
                        )}
                    </section>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Categories;
