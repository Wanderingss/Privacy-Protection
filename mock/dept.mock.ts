import { defineMock } from "./base";

export default defineMock([
  {
    url: "dept/options",
    method: ["GET"],
    body: {
      code: "00000",
      data: [
        {
          value: 1,
          label: "无锡学院",
          children: [
            {
              value: 2,
              label: "物联网工程学院",
            },
            {
              value: 3,
              label: "自动化学院",
              
            },
          ],
        },
        {
          value: 4,
          label: "阜阳师范大学",
          children: [
            {
              value: 5,
              label: "物理与电子工程学院",
            },
            {
              value: 6,
              label: "计算机工程学院",
            },
          ],
        },
      ],
      msg: "一切ok",
    },
  },

  {
    url: "dept",
    method: ["GET"],
    body: {
      code: "00000",
      data: [
        {
          id: 1,
          parentId: 0,
          name: "有来技术",
          code: "YOULAI",
          sort: 1,
          status: 1,
          children: [
            {
              id: 2,
              parentId: 1,
              name: "研发部门",
              code: "RD001",
              sort: 1,
              status: 1,
              children: [],
              createTime: null,
              updateTime: "2022-04-19 12:46",
            },
            {
              id: 3,
              parentId: 1,
              name: "测试部门",
              code: "QA001",
              sort: 1,
              status: 1,
              children: [],
              createTime: null,
              updateTime: "2022-04-19 12:46",
            },
          ],
          createTime: null,
          updateTime: null,
        },
      ],
      msg: "一切ok",
    },
  },

  // 新增部门
  {
    url: "dept",
    method: ["POST"],
    body({ body }) {
      return {
        code: "00000",
        data: null,
        msg: "新增部门" + body.name + "成功",
      };
    },
  },

  // 获取部门表单数据
  {
    url: "dept/:id/form",
    method: ["GET"],
    body: ({ params }) => {
      return {
        code: "00000",
        data: deptMap[params.id],
        msg: "一切ok",
      };
    },
  },

  // 修改部门
  {
    url: "dept/:id",
    method: ["PUT"],
    body({ body }) {
      return {
        code: "00000",
        data: null,
        msg: "修改部门" + body.name + "成功",
      };
    },
  },

  // 删除部门
  {
    url: "dept/:id",
    method: ["DELETE"],
    body({ params }) {
      return {
        code: "00000",
        data: null,
        msg: "删除部门" + params.id + "成功",
      };
    },
  },
]);

// 部门映射表数据
const deptMap: Record<string, any> = {
  1: {
    id: 1,
    name: "无锡学院",
    code: "WUXI",
    parentId: 0,
    status: 1,
    sort: 1,
  },
  2: {
    id: 2,
    name: "物联网工程学院",
    code: "WULIANWANG",
    parentId: 1,
    status: 1,
    sort: 1,
  },
  3: {
    id: 3,
    name: "自动化学院",
    code: "ZIDONGHUA",
    parentId: 1,
    status: 1,
    sort: 1,
  },
};
