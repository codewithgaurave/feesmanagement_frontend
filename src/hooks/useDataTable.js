import { useEffect, useRef } from 'react';
import $ from 'jquery';

// Make jQuery available globally for DataTables
window.$ = window.jQuery = $;

import 'datatables.net';
import 'datatables.net-buttons';
import 'datatables.net-buttons/js/buttons.html5';
import 'datatables.net-buttons/js/buttons.print';
import 'datatables.net-buttons/js/buttons.colVis';
import 'datatables.net-responsive';

const useDataTable = (data, columns, options = {}) => {
  const tableRef = useRef(null);
  const dataTableRef = useRef(null);

  useEffect(() => {
    if (tableRef.current) {
      if (dataTableRef.current) {
        dataTableRef.current.destroy();
      }

      dataTableRef.current = $(tableRef.current).DataTable({
        data: data || [],
        columns: columns,
        responsive: true,
        pageLength: 10,
        lengthMenu: [[5, 10, 25, 50, 100, -1], [5, 10, 25, 50, 100, "All"]],
        dom: '<"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>' +
             '<"row"<"col-sm-12"B>>' +
             '<"row"<"col-sm-12"tr>>' +
             '<"row"<"col-sm-12 col-md-5"i><"col-sm-12 col-md-7"p>>',
        buttons: [
          {
            extend: 'copy',
            text: '<i class="fas fa-copy"></i> Copy',
            className: 'dt-button buttons-copy',
            exportOptions: {
              columns: ':visible:not(.no-export)'
            }
          },
          {
            extend: 'csv',
            text: '<i class="fas fa-file-csv"></i> CSV',
            className: 'dt-button buttons-csv',
            exportOptions: {
              columns: ':visible:not(.no-export)'
            }
          },
          {
            extend: 'excel',
            text: '<i class="fas fa-file-excel"></i> Excel',
            className: 'dt-button buttons-excel',
            exportOptions: {
              columns: ':visible:not(.no-export)'
            }
          },
          {
            extend: 'pdf',
            text: '<i class="fas fa-file-pdf"></i> PDF',
            className: 'dt-button buttons-pdf',
            exportOptions: {
              columns: ':visible:not(.no-export)'
            },
            customize: function(doc) {
              doc.defaultStyle.fontSize = 9;
              doc.styles.tableHeader.fontSize = 11;
              doc.styles.tableHeader.fillColor = '#007bff';
              doc.styles.tableHeader.color = 'white';
            }
          },
          {
            extend: 'print',
            text: '<i class="fas fa-print"></i> Print',
            className: 'dt-button buttons-print',
            exportOptions: {
              columns: ':visible:not(.no-export)'
            }
          },
          {
            extend: 'colvis',
            text: '<i class="fas fa-columns"></i> Columns',
            className: 'dt-button buttons-colvis'
          }
        ],
        language: {
          search: "Search:",
          lengthMenu: "Show _MENU_ entries per page",
          info: "Showing _START_ to _END_ of _TOTAL_ entries",
          infoEmpty: "Showing 0 to 0 of 0 entries",
          infoFiltered: "(filtered from _MAX_ total entries)",
          paginate: {
            first: "First",
            last: "Last",
            next: "Next",
            previous: "Previous"
          },
          emptyTable: "No data available in table",
          zeroRecords: "No matching records found"
        },
        order: [[0, 'desc']],
        columnDefs: [
          {
            targets: 'no-sort',
            orderable: false
          },
          {
            targets: 'no-export',
            visible: true,
            searchable: false
          }
        ],
        ...options
      });

      $(tableRef.current).addClass('stripe hover');
      $('.dataTables_filter input').attr('placeholder', 'Search records...');
    }

    return () => {
      if (dataTableRef.current) {
        dataTableRef.current.destroy();
        dataTableRef.current = null;
      }
    };
  }, [data, columns, options]);

  return tableRef;
};

export default useDataTable;