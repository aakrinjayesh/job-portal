import React from "react";
import { Table, Spin, Empty } from "antd";

const TableDesign = ({
  loading = false,
  columns = [],
  dataSource = [],
  rowKey = "id",
  rowSelection,
  scroll = { y: 400 },
  emptyText = "No data found",
}) => {
  return (
    <Spin spinning={loading}>
      <Table
        columns={columns}
        dataSource={dataSource}
        rowKey={rowKey}
        rowSelection={rowSelection}
        scroll={scroll}
        pagination={false}
        locale={{
          emptyText: <Empty description={emptyText} />,
        }}
        style={{
          borderRadius: 12,
        }}
      />
    </Spin>
  );
};

export default TableDesign;
