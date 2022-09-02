import React, { useState, useEffect } from "react";
import axios from "axios";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { FilterMatchMode } from "primereact/api";

const MovieList = () => {
  const [defaultMovieList, setDefaultMovieList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [dataSource, setDataSource] = useState([]);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    Title: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    Genre: { value: null, matchMode: FilterMatchMode.CONTAINS },
    Year: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    Runtime: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  });
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [isSearchByTitle, setIsSearchByTitle] = useState(false);
  const [titleDataSource, setTitleDataSource] = useState({});
  const [movieIds, setMovieIds] = useState([]);

  useEffect(() => {
    axios
      .get("https://imdb-api.com/en/API/Top250Movies/k_9rbyaw13")
      .then((response) => {
        let allIds = response.data.items.map((i, v) => {
          return i.id;
        });
        setMovieIds(allIds);
        setTotalRecords(response.data.items.length);
        setLoading(false);
      });
    setDefaultMovieList([]);
  }, []);

  useEffect(() => {
    if (movieIds.length > 0) {
      var tempIds = movieIds.slice(0, 100);
      movieIds.forEach((value, index) => {
        var isFound = defaultMovieList.some((x) => x.imdbID === value);
        if (!isFound) {
          axios
            .get(
              "https://www.omdbapi.com/?i=" +
                tempIds[index] +
                "&apikey=d578ab92"
            )
            .then((response) => {
              setDefaultMovieList((currentArray) => [
                ...currentArray,
                response.data,
              ]);
              setDataSource((currentArray) => [...currentArray, response.data]);
            });
        }
      });
    }
  }, [movieIds]);

  const columns = [
    { field: "rank", header: "Rank" },
    { field: "Title", header: "Title", isSearchAble: true },
    { field: "Poster", header: "Poster Thumbnail", isImage: true },
    { field: "Director", header: "Director(s)" },
    { field: "Year", header: "Release Year" },
    { field: "Genre", header: "Genre(s)", isSortable: true },
    { field: "Language", header: "Language(s)" },
    { field: "Country", header: "Country of Origin" },
    {
      field: "Rated",
      header: "MPA content rating (G, PG, PG-13, R, NC-17)",
    },
    {
      field: "Runtime",
      header: "Runtime",
    },
  ];

  const paginatorLeft = (
    <Button type="button" icon="pi pi-refresh" className="p-button-text" />
  );

  const paginatorRight = (
    <Button type="button" icon="pi pi-cloud" className="p-button-text" />
  );

  const imageBodyTemplate = (rowData) => {
    return (
      <img
        src={rowData.Poster}
        onError={(e) =>
          (e.target.src =
            "https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png")
        }
        alt={rowData.image}
        className="product-image"
      />
    );
  };

  const dynamicColumns = columns.map((col, i) => {
    switch (col.field) {
      case "Title":
        return (
          <Column
            key={col.field}
            field={col.field}
            header={col.header}
            filter
            filterField={"Title"}
            filterPlaceholder="Search by title"
            showFilterMenu={false}
          />
        );
      case "Poster":
        return (
          <Column
            key={col.field}
            field={col.field}
            header={col.header}
            body={imageBodyTemplate}
          />
        );
      case "Genre":
        return (
          <Column
            key={col.field}
            field={col.field}
            header={col.header}
            sortable={col.isSortable === true ? true : false}
            filter
            filterField="Genre"
            filterPlaceholder="Search by genre"
            showFilterMenu={false}
          />
        );
      case "Year":
        return (
          <Column
            key={col.field}
            field={col.field}
            header={col.header}
            sortable={col.isSortable === true ? true : false}
            filter
            filterField="Year"
            filterPlaceholder="Search by year"
            showFilterMenu={false}
          />
        );
      case "Runtime":
        return (
          <Column
            key={col.field}
            field={col.field}
            header={col.header}
            hidden={true}
          />
        );
      default:
        return <Column key={col.field} field={col.field} header={col.header} />;
    }
  });

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;

    let _filters = { ...filters };
    _filters["Runtime"].value = value;

    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const onSearchMovieByTitle = (e) => {
    setLoading(true);
    setIsSearchByTitle(true);
    const value = e.target.value;

    axios
      .get("https://www.omdbapi.com/?t=" + value + "&apikey=d578ab92")
      .then((response) => {
        setTitleDataSource(response.data);
      });
    setLoading(false);
  };

  const renderHeader = () => {
    return (
      <div className="flex justify-content-end">
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            style={{ width: "300px" }}
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Filter by runtime (enter minutes)"
          />
        </span>
      </div>
    );
  };

  return (
    <>
      <div className="datatable-templating-demo">
        {isSearchByTitle && titleDataSource !== undefined && (
          <>
            <h2> searched by title result</h2>
          </>
        )}
        {!isSearchByTitle && (
          <div className="card">
            <DataTable
              showGridlines
              responsiveLayout="scroll"
              value={dataSource}
              rows={rows}
              dataKey="id"
              filterDisplay="row"
              loading={loading}
              size="normal"
              emptyMessage="No data found."
              globalFilterFields={["title"]}
              filters={filters}
              header={renderHeader}
              paginator
              paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
              currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
              rowsPerPageOptions={[10, 20, 50]}
              paginatorLeft={paginatorLeft}
              paginatorRight={paginatorRight}
            >
              {dynamicColumns}
            </DataTable>
          </div>
        )}
      </div>
    </>
  );
};

export default MovieList;
