import { isUrl } from '../utils/utils';
// 一般的项目中菜单和路由是集中在一块配置的,格式如下:
// {
//     name: 'xxx',
//     icon: 'xxx',
//     path: 'xxx',
//     component:xxx,
//     children:[xxx]
// }
// 配置完成后直接map循环输出Route组件
// pro中将菜单和路由拆解，分menu和router两个文件管理


// 菜单对象的基本配置如下：
// {
//     authority:undefined, //权限
//     icon:"dashboard",    //图标
//     name:"dashboard",    //名称
//     path:"/dashboard",   //路径
//     children:[           //子集菜单集合
//         {name: "分析页", path: "/dashboard/analysis", authority: undefined},
//         {name: "监控页", path: "/dashboard/monitor", authority: undefined},
//         {name: "工作台", path: "/dashboard/workplace", authority: undefined}
//     ]
// }
const menuData = [
  {
    name: '新布局',
    icon: 'meh-o',
    path: 'new',
    children: [{
      name: '页面一',
      path: 'page1',
    }, {
      name: '页面二',
      path: 'page2',
    },
    ],
  },
  {
    name: 'dashboard',
    icon: 'dashboard',
    path: 'dashboard',
    children: [
      {
        name: '分析页',
        path: 'analysis',
      },
      {
        name: '监控页',
        path: 'monitor',
      },
      {
        name: '工作台',
        path: 'workplace',
        hideInBreadcrumb: true,
        hideInMenu: true, // 隐藏该条
      },
      {
        name: '测试页',
        path: 'test',
        // hideInBreadcrumb: true,
      },
    ],
  },
  {
    name: '表单页',
    icon: 'form',
    path: 'form',
    children: [
      {
        name: '基础表单',
        path: 'basic-form',
      },
      {
        name: '分步表单',
        path: 'step-form',
      },
      {
        name: '高级表单',
        authority: 'admin',
        path: 'advanced-form',
      },
    ],
  },
  {
    name: '列表页',
    icon: 'table',
    path: 'list',
    children: [
      {
        name: '查询表格',
        path: 'table-list',
      },
      {
        name: '标准列表',
        path: 'basic-list',
      },
      {
        name: '卡片列表',
        path: 'card-list',
      },
      {
        name: '搜索列表',
        path: 'search',
        children: [
          {
            name: '搜索列表（文章）',
            path: 'articles',
          },
          {
            name: '搜索列表（项目）',
            path: 'projects',
          },
          {
            name: '搜索列表（应用）',
            path: 'applications',
          },
        ],
      },
    ],
  },
  {
    name: '详情页',
    icon: 'profile',
    path: 'profile',
    children: [
      {
        name: '基础详情页',
        path: 'basic',
      },
      {
        name: '高级详情页',
        path: 'advanced',
        authority: 'admin',
      },
    ],
  },
  {
    name: '结果页',
    icon: 'check-circle-o',
    path: 'result',
    children: [
      {
        name: '成功',
        path: 'success',
      },
      {
        name: '失败',
        path: 'fail',
      },
    ],
  },
  {
    name: '异常页',
    icon: 'warning',
    path: 'exception',
    children: [
      {
        name: '403',
        path: '403',
      },
      {
        name: '404',
        path: '404',
      },
      {
        name: '500',
        path: '500',
      },
      {
        name: '触发异常',
        path: 'trigger',
        hideInMenu: true,
      },
    ],
  },
  {
    name: '账户',
    icon: 'user',
    path: 'user',
    authority: 'guest',
    children: [
      {
        name: '登录',
        path: 'login',
      },
      {
        name: '注册',
        path: 'register',
      },
      {
        name: '注册结果',
        path: 'register-result',
      },
    ],
  },

  {
    name: '用户管理',
    icon: 'form',
    path: 'member',
    children: [
      {
        name: '用户管理',
        path: 'member-manager',
      },
    ],
  },
];

// 1.如何让用户在配置时快速生成path路径：
// 解决方案为用户在配置时只需要输入末级路径，完成path路径由工具方法补全
// 代码见formatter函数。
// 2.权限字段配置：
// 父级配置了权限A，子级默认都具备权限A，如果子级单独配置了权限，则会
// 覆盖父级的权限A
// 3.菜单与路由配置合并时，只会取菜单配置中的name和authority属性合并到路由配置中
// hideInMenu属性只是针对左侧导航相关的配置字段。
function formatter(data, parentPath = '/', parentAuthority) {
  return data.map(item => {
    let { path } = item;
    if (!isUrl(path)) {
      path = parentPath + item.path;
    }
    const result = {
      ...item,
      path,
      authority: item.authority || parentAuthority,
    };
    if (item.children) {
      result.children = formatter(item.children, `${parentPath}${item.path}/`, item.authority);
    }
    return result;
  });
}

export const getMenuData = () => formatter(menuData);
