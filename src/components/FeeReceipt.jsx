import React from 'react';

const FeeReceipt = ({ student, fees = [] }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}/${month}/${year}`;
    } catch (error) {
      return 'N/A';
    }
  };

  const calculateTotal = () => {
    return (student?.totalFee || 0);
  };

  return (
    <div style={{
      width: '100%',
      backgroundColor: '#ffffff',
      border: '2px solid #2c3e50',
      padding: '30px',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        marginBottom: '20px',
        paddingBottom: '15px',
        borderBottom: '2px solid #34495e'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          border: '2px solid #2c3e50',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ecf0f1',
          flexShrink: 0
        }}>
          <img
            src="/logo.png"
            alt="Institute Logo"
            style={{ width: "80px", height: "auto" }}
          />
        </div>
        <div style={{ flexGrow: 1, textAlign: 'center' }}>
          <h1 style={{
            color: '#2c3e50',
            fontSize: '20px',
            fontWeight: 'bold',
            marginBottom: '5px',
            letterSpacing: '0.5px'
          }}>CAREER INSTITUTE OF MEDICAL SCIENCES & HOSPITAL</h1>
          <p style={{
            color: '#34495e',
            fontSize: '14px',
            marginBottom: '5px'
          }}>IIM ROAD, GHAILLA LUCKNOW - 226 013</p>
          <p style={{
            color: '#34495e',
            fontSize: '13px',
            fontWeight: 600
          }}>(STUDENT FILE COPY)</p>
        </div>
      </div>

      {/* Receipt Details */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          marginBottom: '10px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              color: '#2c3e50',
              fontSize: '14px',
              fontWeight: 600
            }}>Receipt No.</span>
            <span style={{
              borderBottom: '1px dotted #7f8c8d',
              padding: '4px 8px',
              fontSize: '14px',
              color: '#2c3e50',
              minWidth: '80px'
            }}>801</span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginLeft: 'auto'
          }}>
            <span style={{
              color: '#2c3e50',
              fontSize: '14px',
              fontWeight: 600
            }}>Date</span>
            <span style={{
              borderBottom: '1px dotted #7f8c8d',
              padding: '4px 8px',
              fontSize: '14px',
              color: '#2c3e50'
            }}>{formatDate(new Date())}</span>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          marginBottom: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              color: '#2c3e50',
              fontSize: '14px',
              fontWeight: 600
            }}>F.Y.</span>
            <span style={{
              borderBottom: '1px dotted #7f8c8d',
              padding: '4px 8px',
              fontSize: '14px',
              color: '#2c3e50',
              minWidth: '80px'
            }}>2025-26</span>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          marginBottom: '10px',
          flexWrap: 'wrap'
        }}>
          <span style={{
            color: '#2c3e50',
            fontSize: '14px',
            fontWeight: 600
          }}>Name</span>
          <span style={{
            borderBottom: '1px dotted #7f8c8d',
            padding: '4px 8px',
            fontSize: '14px',
            color: '#2c3e50',
            minWidth: '250px'
          }}>{student?.name || ''}</span>
          <span style={{
            color: '#2c3e50',
            fontSize: '14px',
            fontWeight: 600
          }}>Batch :</span>
          <span style={{
            borderBottom: '1px dotted #7f8c8d',
            padding: '4px 8px',
            fontSize: '14px',
            color: '#2c3e50',
            minWidth: '100px'
          }}>{student?.class || 'MBBS'}</span>
          <span style={{
            color: '#2c3e50',
            fontSize: '14px',
            fontWeight: 600
          }}>Year</span>
          <span style={{
            borderBottom: '1px dotted #7f8c8d',
            padding: '4px 8px',
            fontSize: '14px',
            color: '#2c3e50',
            minWidth: '80px'
          }}>{student?.year || ''}</span>
        </div>
      </div>

      {/* Fee Table */}
      <div style={{
        marginBottom: '20px',
        border: '2px solid #34495e'
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#ecf0f1' }}>
              <th style={{
                color: '#2c3e50',
                fontSize: '15px',
                fontWeight: 'bold',
                padding: '12px',
                textAlign: 'center',
                border: '1px solid #34495e',
                width: '10%'
              }}>S.No.</th>
              <th style={{
                color: '#2c3e50',
                fontSize: '15px',
                fontWeight: 'bold',
                padding: '12px',
                textAlign: 'center',
                border: '1px solid #34495e',
                width: '60%'
              }}>Fee Structure</th>
              <th style={{
                color: '#2c3e50',
                fontSize: '15px',
                fontWeight: 'bold',
                padding: '12px',
                textAlign: 'center',
                border: '1px solid #34495e',
                width: '30%'
              }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ border: '1px solid #bdc3c7' }}>
              <td style={{
                textAlign: 'center',
                padding: '8px',
                color: '#2c3e50',
                fontSize: '14px',
                border: '1px solid #bdc3c7'
              }}>1</td>
              <td style={{
                padding: '8px 15px',
                color: '#34495e',
                fontSize: '14px',
                border: '1px solid #bdc3c7'
              }}>Tuition Fee</td>
              <td style={{
                textAlign: 'right',
                padding: '8px 15px',
                color: '#2c3e50',
                fontSize: '14px',
                border: '1px solid #bdc3c7'
              }}>{(student?.tuitionFee || 0).toLocaleString()}</td>
            </tr>
            <tr style={{ border: '1px solid #bdc3c7' }}>
              <td style={{
                textAlign: 'center',
                padding: '8px',
                color: '#2c3e50',
                fontSize: '14px',
                border: '1px solid #bdc3c7'
              }}>2</td>
              <td style={{
                padding: '8px 15px',
                color: '#34495e',
                fontSize: '14px',
                border: '1px solid #bdc3c7'
              }}>Hostel Fee</td>
              <td style={{
                textAlign: 'right',
                padding: '8px 15px',
                color: '#2c3e50',
                fontSize: '14px',
                border: '1px solid #bdc3c7'
              }}>{(student?.hostelFee || 0).toLocaleString()}</td>
            </tr>
            <tr style={{ border: '1px solid #bdc3c7' }}>
              <td style={{
                textAlign: 'center',
                padding: '8px',
                color: '#2c3e50',
                fontSize: '14px',
                border: '1px solid #bdc3c7'
              }}>3</td>
              <td style={{
                padding: '8px 15px',
                color: '#34495e',
                fontSize: '14px',
                border: '1px solid #bdc3c7'
              }}>Security Fee</td>
              <td style={{
                textAlign: 'right',
                padding: '8px 15px',
                color: '#2c3e50',
                fontSize: '14px',
                border: '1px solid #bdc3c7'
              }}>{(student?.securityFee || 0).toLocaleString()}</td>
            </tr>
            <tr style={{ border: '1px solid #bdc3c7' }}>
              <td style={{
                textAlign: 'center',
                padding: '8px',
                color: '#2c3e50',
                fontSize: '14px',
                border: '1px solid #bdc3c7'
              }}>4</td>
              <td style={{
                padding: '8px 15px',
                color: '#34495e',
                fontSize: '14px',
                border: '1px solid #bdc3c7'
              }}>AC Charge</td>
              <td style={{
                textAlign: 'right',
                padding: '8px 15px',
                color: '#2c3e50',
                fontSize: '14px',
                border: '1px solid #bdc3c7'
              }}>{(student?.acCharge || 0).toLocaleString()}</td>
            </tr>
            <tr style={{ border: '1px solid #bdc3c7' }}>
              <td style={{
                textAlign: 'center',
                padding: '8px',
                color: '#2c3e50',
                fontSize: '14px',
                border: '1px solid #bdc3c7'
              }}>5</td>
              <td style={{
                padding: '8px 15px',
                color: '#34495e',
                fontSize: '14px',
                border: '1px solid #bdc3c7'
              }}>Miscellaneous Fee</td>
              <td style={{
                textAlign: 'right',
                padding: '8px 15px',
                color: '#2c3e50',
                fontSize: '14px',
                border: '1px solid #bdc3c7'
              }}>{(student?.miscellaneousFee || 0).toLocaleString()}</td>
            </tr>
            <tr style={{
              backgroundColor: '#ecf0f1',
              fontWeight: 'bold'
            }}>
              <td colSpan="2" style={{
                textAlign: 'center',
                padding: '12px',
                color: '#2c3e50',
                fontSize: '15px',
                fontWeight: 'bold',
                border: '1px solid #34495e'
              }}>TOTAL AMOUNT</td>
              <td style={{
                textAlign: 'right',
                padding: '12px 15px',
                color: '#2c3e50',
                fontSize: '15px',
                fontWeight: 'bold',
                border: '1px solid #34495e'
              }}>₹{calculateTotal().toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Payment Details */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '12px',
          flexWrap: 'wrap'
        }}>
          <span style={{
            color: '#2c3e50',
            fontSize: '14px',
            fontWeight: 600
          }}>Cash/D.D./Cheque No.</span>
          <span style={{
            borderBottom: '1px dotted #7f8c8d',
            padding: '4px 8px',
            fontSize: '14px',
            color: '#2c3e50',
            minWidth: '150px'
          }}></span>
          <span style={{
            color: '#2c3e50',
            fontSize: '14px',
            fontWeight: 600
          }}>Date</span>
          <span style={{
            borderBottom: '1px dotted #7f8c8d',
            padding: '4px 8px',
            fontSize: '14px',
            color: '#2c3e50',
            minWidth: '100px'
          }}></span>
          <span style={{
            color: '#2c3e50',
            fontSize: '14px',
            fontWeight: 600
          }}>Rs.</span>
          <span style={{
            borderBottom: '1px dotted #7f8c8d',
            padding: '4px 8px',
            fontSize: '14px',
            color: '#2c3e50',
            minWidth: '150px'
          }}></span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '12px'
        }}>
          <span style={{
            color: '#2c3e50',
            fontSize: '14px',
            fontWeight: 600
          }}>(in words)</span>
          <span style={{
            flex: 1,
            borderBottom: '1px dotted #7f8c8d',
            padding: '4px 8px',
            fontSize: '14px',
            color: '#2c3e50',
            minWidth: '200px'
          }}></span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '12px'
        }}>
          <span style={{
            color: '#2c3e50',
            fontSize: '14px',
            fontWeight: 600
          }}>Receiver's Name :</span>
          <span style={{
            borderBottom: '1px dotted #7f8c8d',
            padding: '4px 8px',
            fontSize: '14px',
            color: '#2c3e50',
            minWidth: '250px'
          }}></span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '12px'
        }}>
          <span style={{
            color: '#2c3e50',
            fontSize: '14px',
            fontWeight: 600
          }}>Receiver's Signature :</span>
          <span style={{
            flex: 1,
            borderBottom: '1px dotted #7f8c8d',
            height: '30px',
            minWidth: '200px'
          }}></span>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginTop: '30px',
        paddingTop: '20px',
        borderTop: '1px solid #bdc3c7'
      }}>
        <div style={{
          color: '#7f8c8d',
          fontSize: '12px',
          fontStyle: 'italic'
        }}>* Subject to encashment of cheque</div>
        <div style={{ textAlign: 'right' }}>
          <div style={{
            color: '#2c3e50',
            fontSize: '14px',
            fontWeight: 600,
            paddingTop: '40px',
            borderTop: '1px solid #2c3e50',
            minWidth: '180px',
            textAlign: 'center'
          }}>Authorised Signatory</div>
        </div>
      </div>
    </div>
  );
};

export default FeeReceipt;