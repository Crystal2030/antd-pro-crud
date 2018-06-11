1. 配置新的路由和菜单
   在Ant Design Pro中，前端路由是通过react-router4.0进行路由管理的。 
   
   ```
    const routerConfig = {
           '/': {
             component: dynamicWrapper(app, [], () => import('../layouts/BasicLayout')),
           },
           '/dashboard/monitor': {
             component: dynamicWrapper(app, ['monitor'], () => import('../routes/Dashboard/Monitor')),
           },
           '/dashboard/workplace': {
             component: dynamicWrapper(app, ['monitor'], () => import('../routes/Dashboard/WorkSpace')),
           }
       }
   ```
   其中，包含了三个路由：/，/dashboard/monitor，/dashboard/workplace。 
   同时，指定了这三个路由分别对应的页面文件为layouts/BasicLayout.js，routes/Dashboard/Monitor.js以及Dashboard/WorkSpace.js文件。
   侧边栏中填写一项来对应到我们添加的路由中：
   ```
    const menuData = [{
      name: 'dashboard',
      icon: 'dashboard',  // https://demo.com/icon.png or <icon type="dashboard">
      path: 'dashboard',
      children: [{
        name: '分析页',
        path: 'analysis',
      }, {
        name: '监控页',
        path: 'monitor',
      }, {
        name: '工作台',
        path: 'workplace',
      }, {
        name: '测试页',
        path: 'test',
      }],
    }, {
      // 更多配置
    }];
   ```
   
2. 创建一个页面  在src/routes下创建对应的js文件即可。 
3. 新增一个组件  在components文件夹下创建一个组件ImageWrapper，并在page1.js引入并使用。
4. 增加service和model
    假设我们的page1.js页面需要发送请求，接收数据并在页面渲染时使用接收到的数据呢？ 
    例如，我们可以在组件加载时发送一个请求来获取数据。
    ```
      componentDidMount() {
        const { dispatch } = this.props;
        dispatch({
            type: 'rule/fetch',
          });
        dispatch({
          type: 'project/fetchNotice',
        });
        dispatch({
          type: 'activities/fetchList',
        });
        dispatch({
          type: 'chart/fetch',
        });
      }
    ```
    此时，它将会找到对应的models中的函数来发送请求：
    
    ```
     import { queryBookList} from '../services/api';
     
     export default {
       namespace: 'page1',
     
       state: {
         list: [],
         pagination: {},
       },
     
       effects: {
         *fetch({payload}, { call, put}) {
           // call 用于调用异步逻辑  put: 用于触发action
           const response = yield call(queryBookList, payload);
           yield put({
             type: 'save',
             payload: response,
           });
         },
       },
     
       reducers: {
         save(state, action) {
           return {
             ...state,
             data: action.payload,
           }
         },
       },
     };




    ```
    
    而真正发送请求的实际是service文件夹下的文件进行的。
    
    ```
      export async function queryBookList(params) {
        return request(`/api/book?${stringify(params)}`);
      }

    ```
    
    在routes文件夹中，我们可以直接在render部分使用应该得到的返回值进行渲染显示：
    ```
    @connect(({ page1, loading }) => ({
      page1,
      loading: loading.models.rule,
    }))
    ```
    
5. mock数据  主要依赖的是.roadhogrc.mock.js文件   mock机制（其实也是个node服务）捕获service的http请求，对http请求进行处理，
也就是传入request方法的第一个参数url要和.roadhogrc.mock.js文件设置的捕获url一致
   在上面的例子中，针对GET和POST请求应该如下进行数据Mock。
   
6. 与后端联调时，改：‘GET /api/users' : { users : [ 1 , 2] }  为  'GET /api/users' : http://服务器id:端口号（eg: http://127.0.0.1:8080/）        
    
7. 如何模拟请求不同服务器接口？
   如何模拟请求不同服务器接口，利用roadhog会很简单，因为roadhog已经提供了代理的接口，你可以配置：
   
  ```
    const path = require('path');
    
    export default {
      entry: 'src/index.js',
      extraBabelPlugins: [
        ['import', { libraryName: 'antd', libraryDirectory: 'es', style: true }],
      ],
      env: {
        development: {
          extraBabelPlugins: ['dva-hmr'],
        },
      },
      alias: {
        components: path.resolve(__dirname, 'src/components/'),
      },
      ignoreMomentLocale: true,
      theme: './src/theme.js',
      html: {
        template: './src/index.ejs',
      },
      disableDynamicImport: true,
      publicPath: '/',
      hash: true,
      proxy: { // 该属性下进行url代理的配置
        "/api/list": {
          "target": "http://10.10.33.44:8761/",
          "changeOrigin": true,
        }
      }
    };


  ```
  
  当然真实的代理是需要后端支持的，前端项目下有一个基于express的node微后台，负责登录验证和接口代理，使用http-proxy-middleware 进行代理
  
  ```
    const express = require('express');
    const path = require('path');
    const favicon = require('serve-favicon');
    const cookieParser = require('cookie-parser');
    const compression = require('compression');
    const history = require('connect-history-api-fallback');
    
    const passport = require('./passport');
    const proxys = require('./routes/proxys');
    const users = require('./routes/users');
    const config = require('./config');
    
    const app = express();
    
    // for gzip
    app.use(compression());
    
    // 配置日志
    require('./logger')(app);
    
    // view engine setup
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'ejs');
    
    // uncomment after placing your favicon in /public
    app.use(favicon(path.join(__dirname, 'public', 'logo.png')));
    // app.use(bodyParser.json());
    // app.use(bodyParser.urlencoded({ extended: true }));
    app.use(cookieParser());
    // 配合前端使用history
    // 设置路由
    
    app.use('/api', proxys);
    app.use('/users', users);
    app.use(history());
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(require('express-session')({ secret: 'Gi6zDvtS5!AC4hV13Wv@H9kl5^@ItBl0', resave: true, saveUninitialized: true }));
    
    // 加载配置
    config(app);
    
    // 设置passport
    passport(app);
    
    
    // catch 404 and forward to error handler
    app.use((req, res, next) => {
      const err = new Error('Not Found');
      err.status = 404;
      next(err);
    });
    
    // error handler
    app.use((err, req, res) => {
      // set locals, only providing error in development
      res.locals.message = err.message;
      res.locals.error = req.app.get('env') === 'development' ? err : {};
    
      // render the error page
      res.status(err.status || 500);
      res.render('error');
    });
    
    module.exports = app;
  ```
  
  ```
    /**
     * 反向代理文件
     */
    const express = require('express');
    
    const router = express.Router();
    const proxy = require('http-proxy-middleware');
    
    // 代理服务
    router.use('/', proxy({
      target: 'http://120.79.88.200:8761',
      changeOrigin: true,
      onProxyReq(proxyReq, req) {
        if (req.user && req.user.accessToken) { proxyReq.setHeader('Authorization', `Bearer ${req.user.accessToken}`); }
      },
      ws: true,
    }));
    
    module.exports = router;
  ```
