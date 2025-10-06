import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Library.css";

const Library = () => {
  const [publications, setPublications] = useState([]);
  const [filteredPublications, setFilteredPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    access_type: "",
    author: ""
  });

  useEffect(() => {
    fetchPublications();
  }, []);

  useEffect(() => {
    filterPublications();
  }, [publications, filters]);

  const fetchPublications = async () => {
    try {
      const response = await axios.get("http://localhost:5000/publications/library");
      setPublications(response.data);
    } catch (error) {
      console.error("Error fetching publications:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterPublications = () => {
    let filtered = publications;

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(pub => 
        pub.title.toLowerCase().includes(searchTerm) ||
        pub.abstract.toLowerCase().includes(searchTerm) ||
        (pub.keywords && pub.keywords.toLowerCase().includes(searchTerm))
      );
    }

    if (filters.access_type) {
      filtered = filtered.filter(pub => pub.access_type === filters.access_type);
    }

    if (filters.author) {
      filtered = filtered.filter(pub => 
        pub.author_name.toLowerCase().includes(filters.author.toLowerCase())
      );
    }

    setFilteredPublications(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      access_type: "",
      author: ""
    });
  };

  const getAccessIcon = (accessType) => {
    if (accessType === 'free') {
      return <span className="access-icon free" title="Free Access">🆓</span>;
    } else if (accessType === 'paid') {
      return <span className="access-icon paid" title="Paid Access">💰</span>;
    } else if (accessType === 'subscription') {
      return <span className="access-icon subscription" title="Subscription Required">🔒</span>;
    }
    return <span className="access-icon free" title="Free Access">🆓</span>;
  };

  if (loading) {
    return (
      <div className="library-container">
        <div className="loading">Loading publications...</div>
      </div>
    );
  }

  return (
    <div className="library-container">
      <div className="library-header">
        <h1>📚 Research Library</h1>
        <p>Discover and access research papers from around the world</p>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <h3>🔍 Search & Filter</h3>
        <div className="filters-grid">
          <div className="filter-group">
            <label>Search Papers</label>
            <input
              type="text"
              placeholder="Search by title, abstract, or keywords..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Access Type</label>
            <select
              value={filters.access_type}
              onChange={(e) => handleFilterChange('access_type', e.target.value)}
            >
              <option value="">All Access Types</option>
              <option value="free">🆓 Free Access</option>
              <option value="paid">💰 Paid Access</option>
              <option value="subscription">🔒 Subscription Required</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Author</label>
            <input
              type="text"
              placeholder="Search by author name..."
              value={filters.author}
              onChange={(e) => handleFilterChange('author', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <button className="clear-filters" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="results-info">
        <p>
          Showing {filteredPublications.length} of {publications.length} publications
        </p>
      </div>

      {/* Publications Grid */}
      <div className="publications-grid">
        {filteredPublications.length > 0 ? (
          filteredPublications.map((pub) => (
            <div key={pub.id} className="publication-card">
              <div className="publication-header">
                <h3>{pub.title}</h3>
                {getAccessIcon(pub.access_type)}
              </div>
              
              <div className="publication-meta">
                <p className="author">👤 {pub.author_name}</p>
                <p className="date">📅 {new Date(pub.publication_date).toLocaleDateString()}</p>
                {pub.doi && <p className="doi">🔗 DOI: {pub.doi}</p>}
              </div>

              <div className="publication-abstract">
                <p>{pub.abstract}</p>
              </div>

              {pub.keywords && (
                <div className="keywords">
                  {pub.keywords.split(',').map((keyword, index) => (
                    <span key={index} className="keyword-tag">
                      #{keyword.trim()}
                    </span>
                  ))}
                </div>
              )}

              <div className="publication-actions">
                {pub.pdf_path && (
                  <a
                    href={`http://localhost:5000/uploads/${pub.pdf_path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="view-paper-btn"
                  >
                    📄 View Paper
                  </a>
                )}
                
                {pub.access_type === 'paid' && (
                  <button className="contact-author-btn">
                    💌 Contact Author
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            <h3>No publications found</h3>
            <p>Try adjusting your search criteria or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Library;

