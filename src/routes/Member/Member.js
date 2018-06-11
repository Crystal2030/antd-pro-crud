import React, {Purecomponent} from 'react';
import { Route, Redirect, Switch } from 'dva/router';
import {getRoutes} from '../../utils/utils';

export default class Member extends Purecomponent {
  render() {
    const {match, routerData} = this.props;
    // 经过 getRoutes 处理之后的路由数据就可直接用于生成路由列表：
    const routes = getRoutes(match.path, routerData);

    return (
      <div>
        <Switch>
          {
            routes.map(item => (
              <Route
                key={item.key}
                path={item.path}
                component={item.component}
                exact={item.exact}
              />
            ))
          }
          <Redirect />
        </Switch>
      </div>
    )
  }
}
