import React, {PureComponent, Fragment} from 'react';
import {
  Row,
  Card,
  Form,
  Input,
  Button,
  Modal,
  message,
  Divider,
} from 'antd';
import {connect} from "dva";
import moment from "moment";

import StandardTable from '../../components/StandardTable';
import ImageWrapper from '../../components/ImageWrapper';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import styles from './TableList.less';

const FormItem = Form.Item;
const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');

// 新增/编辑
const CreateForm = Form.create()(props => {
  const {modalVisible, form,handleEdit, handleAdd, handleModalVisible, book } = props;
  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      form.resetFields();
      console.log('--validateFields-->', JSON.stringify(book) !== '{}')
      if(JSON.stringify(book) !== '{}') {
        handleEdit(fieldsValue)
      } else {

        handleAdd(fieldsValue)
      }
    });
  };
  return (
    <Modal
      title={JSON.stringify(book) !== '{}' ? '修改书籍名称' : '新建书籍'}
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => handleModalVisible()}
    >
      <FormItem>
        {form.getFieldDecorator('bookno', {
          initialValue: book ? book.no : '',
        })(<Input type="hidden" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="书籍名称">
        {form.getFieldDecorator('desc', {
          initialValue: book ? book.name : '',
          rules: [{ required: true, message: '书籍名称不能为空' }],
        })(<Input placeholder="请输入书籍名称" />)}
      </FormItem>
    </Modal>
  );
});
/**
 * 修饰器是一个对类进行处理的函数
 *  1、connect 有两个参数,mapStateToProps以及mapDispatchToProps,一个将状态绑定到组件的props一个将方法绑定到组件的props
 * 2、代码①：将实体page1中的state数据绑定到props，注意绑定的是实体page1整体，使用时需要page1.[state中的具体变量]
 * 3、代码②：通过loading将上文“数据map一”中的models的page1的key对应的value读取出来。赋值给loading，以方便使用，如表格是否有加载书籍列表当然代码
 *    ②也可以通过key value编写：loading.effects["page1/fetch"]
 */
// dva 所封装的 react-redux 的 @connect 装饰器，用来接收绑定的 list 这个 model 对应的 redux store
// 通过connect绑定数据 connect之后, this.props就会添加一个dispatch属性，这里就可以进行请求了
@connect(({ page1, loading }) => ({
  page1, // ①
  page1Loading: loading.models.page1, // ②
}))
@Form.create()
export default class Page1 extends PureComponent {
  state = {
    modalVisible: false,
    selectedRows: [],
    formValues: {},
    book: {},
  };

  componentDidMount() {
    // 查看
    const { dispatch } = this.props;
    dispatch({
      type: 'page1/fetch',
    });
  }

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const { formValues } = this.state;

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    const params = {
      currentPage: pagination.current,
      pageSize: pagination.pageSize,
      ...formValues,
      ...filters,
    };
    if (sorter.field) {
      params.sorter = `${sorter.field}_${sorter.order}`;
    }

    dispatch({
      type: 'page1/fetch',
      payload: params,
    });
  };

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  handleModalVisible = (flag, book={}) => {
    this.setState({
      book,
      modalVisible: !!flag,
    });
  };

  // 新增
  handleAdd = fields => {
    console.log('add--->', fields);
    const { dispatch } = this.props;
    this.setState({
      book: {},
    });
    dispatch({
      type: 'page1/add',
      payload: {
        name: fields.desc,
      },
    });

    message.success('添加成功');
    this.setState({
      modalVisible: false,
    });
  };

  // 编辑
  handleEdit = fields => {
    console.log('edit--->', fields);
    const { dispatch } = this.props;
    dispatch({
      type: 'page1/edit',
      payload: {
        no: fields.bookno,
        name: fields.desc,
      },
    });
    message.success('修改成功');
    this.setState({
      modalVisible: false,
    });

  }

  // 删除
  handleRemove = fields => {
    console.log('remove--->', fields);
    const { dispatch } = this.props;
    console.log('handle remove--->', fields);

    dispatch({
      type: 'page1/remove',
      payload: {
        name: fields.name,
        no: fields.no,
      },
    });

    message.success('删除成功');
  }





  render() {
    const {page1, page1Loading} = this.props;
    const { selectedRows, modalVisible, book } = this.state;
    const {data} = page1;
    console.log('------>', page1, data);

    const columns = [
      {
        title: '书籍编号',
        dataIndex: 'no',
      },
      {
        title: '书籍名称',
        dataIndex: 'name',
      },
      {
        title: '更新时间',
        dataIndex: 'updatedAt',
        sorter: true,
        render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
      },
      {
        title: '操作',
        render: (text, record) => (
          <Fragment>
            <a onClick={() => this.handleModalVisible(true, record)}>编辑</a>
            <Divider type="vertical" />
            <a onClick={() => {this.handleRemove(record)}}>删除</a>
          </Fragment>
        ),
      },
    ];

    const parentMethods = {
      handleEdit: this.handleEdit,
      handleAdd: this.handleAdd,
      handleModalVisible: this.handleModalVisible,
    }

    return (
      <PageHeaderLayout title="书籍管理">
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListOperator}>
              <Button icon="plus" type="primary" onClick={() => this.handleModalVisible(true)}>
                新建
              </Button>
            </div>
            <StandardTable
              selectedRows={selectedRows}
              loading={page1Loading}
              data={page1}
              columns={columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
        <CreateForm {...parentMethods} modalVisible={modalVisible} book={book} />
        <Row>
          <ImageWrapper
            src="https://os.alipayobjects.com/rmsportal/mgesTPFxodmIwpi.png"
            desc="示意图"
          />
        </Row>
      </PageHeaderLayout>
    )
  }
}
