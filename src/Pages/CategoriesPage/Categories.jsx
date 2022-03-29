import axios from 'axios';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroller';

import CustomAccordion from './CustomAccordion';
import CategoryCard from './Category-Card';
import { categoryUrl } from '../../Helpers/CategoryUrl';
import useTitle from '../../Hooks/useTitle';

import styles from './Categories.module.scss';
import { Button, FormControl, MenuItem, Select } from '@mui/material';
import { sortByCategory } from '../../Helpers/CategoryFilters';

const Categories = () => {
  const [hasMore, setHasMore] = useState(false);
  const [categories, setCategories] = useState({
    results: [],
    page: 1,
    total_pages: 1,
  });
  const [sort, setSort] = useState('popularity.desc');

  const handleChangeSort = (event) => {
    setSort(event.target.value);
  };

  const params = useParams();
  const { type, category } = params;
  const { url, title } = categoryUrl(type, category);

  useTitle(`${title} — The Movie Database (TMDB)`);

  const handleLoadMore = async (page) => {
    try {
      const response = await axios.get(`${url}&page=${page}`);
      console.log('page->', response.data);
      if (response.data.page === 1) {
        setCategories({
          results: response.data.results,
          page: response.data.page,
          total_pages: response.data.total_pages,
        });
      } else {
        setCategories((prevState) => {
          return {
            ...prevState,
            results: [...prevState.results, ...response.data.results],
            page: response.data.page,
            total_pages: response.data.total_pages,
          };
        });
      }
      console.log('state:::', categories, 'HAS MORE:::', hasMore);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (categories.page === categories.total_pages) {
      setHasMore(false);
    }
  }, [categories.page, categories.total_pages]);

  useEffect(() => {
    handleLoadMore(1);
  }, [url]);

  const handleSearch = () => {
    console.log('search');
    const filteredData = sortByCategory(sort, categories.results);
    console.log(filteredData);
    setCategories((prevState) => {
      return {
        ...prevState,
        results: filteredData,
      };
    });
  };

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
                      <Select value={sort} onChange={handleChangeSort} margin='none'>
                        <MenuItem value='popularity.desc'>
                          Popularity Descending
                        </MenuItem>
                        <MenuItem value='popularity.asc'>
                          Popularity Ascending
                        </MenuItem>
                        <MenuItem value='vote_average.asc'>
                          Rating Ascending
                        </MenuItem>
                        <MenuItem value='vote_average.desc'>
                          Rating Descending
                        </MenuItem>
                        <MenuItem value='primary_release_date.desc'>
                          Release Date Descending
                        </MenuItem>
                        <MenuItem value='primary_release_date.asc'>
                          Release Date Ascending
                        </MenuItem>
                        <MenuItem value='title.asc'>Title (A-Z)</MenuItem>
                        <MenuItem value='title.desc'>Title (Z-A)</MenuItem>
                      </Select>
                    </FormControl>
                  </CustomAccordion>
                  <CustomAccordion title='Filters'>Filters</CustomAccordion>
                  <CustomAccordion title='Where To Watch'>
                    Where to watch
                  </CustomAccordion>
                  <Button
                    variant='contained'
                    fullWidth
                    className={styles.search_btn}
                    onClick={handleSearch}
                  >
                    Search
                  </Button>
                </div>
                <div>
                  <div className={styles.right_media_container}>
                    <section className={styles.panel_results}>
                      {categories.results.length > 0 && (
                        <div className={styles.media_item_results}>
                          <InfiniteScroll
                            className={styles.page_wrapper}
                            pageStart={1}
                            loadMore={handleLoadMore}
                            hasMore={hasMore}
                            loader={
                              <div className='loader' key={0}>
                                Loading...
                              </div>
                            }
                          >
                            {categories.results.map((data) => (
                              <CategoryCard key={data.id} {...{ data, type }} />
                            ))}
                          </InfiniteScroll>
                          {categories.page <= categories.total_pages && (
                            <Button
                              className={styles.load_more}
                              variant='contained'
                              fullWidth
                              onClick={() => setHasMore(true)}
                            >
                              Load More
                            </Button>
                          )}
                        </div>
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
