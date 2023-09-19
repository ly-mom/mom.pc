<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch">
      <el-form-item :label="$tl('base_service', '服务')" prop="Service" :rules="[{ required: true, message: this.$t('MOM_IsRequire'), trigger: 'blur' }]">
        <RequestService v-model="queryParams.Service" @onchange="serviceChange"></RequestService>
      </el-form-item>
      <!-- <el-form-item >
        <el-radio-group v-model="queryParams.state" size="mini">
          <el-radio-button :label="0" >{{$tl('usual_running','运行中')}}</el-radio-button>
          <el-radio-button :label="1">{{$t('usual_all')}}</el-radio-button>
        </el-radio-group>
      </el-form-item> -->
      <el-form-item v-show="activeName == 'list'" :label="$tl('usual_JobStatus', '任务状态')" prop="jobStatus">
        <el-select v-model="queryParams.Search.jobStatus" :placeholder="$t('usual_choose')" clearable size="small">
          <el-option label="启动" value="Running" />
          <el-option label="暂停" value="Pause" />
          <el-option label="停止" value="Stop" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$tl('sys_job_JobKey', '任务key')" prop="jobKey">
        <el-input v-model="queryParams.Search.jobKey" :placeholder="$t('MOM_InputPlease')" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <!--  <el-form-item :label="$t('sc_TypeFullName')" prop="TypeFullName">
        <el-select v-model="queryParams.jobGroup" :placeholder="$t('usual_choose')" clearable size="small">
          <el-option
            v-for="dict in jobGroupOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('usual_status')" prop="status">
        <el-select v-model="queryParams.status" :placeholder="$t('usual_choose')" clearable size="small">
          <el-option
            v-for="dict in statusOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item> -->
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">{{ $t('usual_search') }}</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">{{ $t('usual_reset') }}</el-button>
      </el-form-item>
    </el-form>
    <el-tabs v-model="activeName" type="card">
      <el-tab-pane :label="$tl('base_job_title1', '任务列表')" name="list"> </el-tab-pane>
      <el-tab-pane :label="$tl('base_job_title2', '执行记录')" name="log"> </el-tab-pane>
    </el-tabs>
    <div v-if="activeName == 'list'">
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd" :disabled="!queryParams.Service" v-hasPermi="['monitor:job:add']">{{ $t('usual_add') }}</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button type="success" plain icon="el-icon-edit" size="mini" :disabled="!queryParams.Service || rowRecord.length != 1" @click="handleUpdate" v-hasPermi="['monitor:job:edit']">{{
            $t('usual_update')
          }}</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="!queryParams.Service || rowRecord.length == 0" @click="handleDelete" v-hasPermi="['monitor:job:remove']">{{
            $t('usual_delete')
          }}</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button type="info" plain icon="el-icon-refresh-right" size="mini" :disabled="!queryParams.Service" @click="handleLoad">{{ $tl('system_reloadAll', '重载所有任务') }}</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button type="sueccess" plain icon="el-icon-set-up" size="mini" :disabled="!queryParams.Service || rowRecord.length != 1" @click="handleRun">{{
            $tl('system_run_now', '立即执行')
          }}</el-button>
        </el-col>
        <right-toolbar :showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>
      <base-table :columns="columns" id="sysjoblist" :list="jobList" v-loading="loading" :options="options" :height="$table.FullViewHeight(200)" @handleSelectionChange="onSelectChange">
        <template slot="action">
          <table-column prop="action" fixed="right" width="280" :label="$t('usual_operation')" min-width="170">
            <div slot="header">
              {{ $tl('usual_operation') }}
              <el-tooltip placement="top">
                <div slot="content">
                  状态说明：<br />
                  启动状态可执行：暂停、停止<br />
                  暂停状态可执行：恢复<br />
                  停止状态可执行：开始<br />
                </div>
                <i class="el-icon-question"></i>
              </el-tooltip>
            </div>
            <template slot-scope="scope">
              <el-button @click="handleStart(scope.row)" icon="el-icon-video-play" type="text" size="mini">{{ $tl('system_start', '开始') }} </el-button>
              <el-button @click="handlePause(scope.row)" icon="el-icon-video-pause" type="text" size="mini">{{ $tl('system_pause', '暂停') }} </el-button>
              <el-button @click="handleResume(scope.row)" icon="el-icon-refresh" type="text" size="mini">{{ $tl('system_resume', '恢复') }} </el-button>
              <el-button @click="handleStop(scope.row)" icon="el-icon-switch-button" type="text" size="mini">{{ $tl('system_stop', '停止') }} </el-button>
              <el-button @click="handleDetail(scope.row)" icon="el-icon-view" type="text" size="mini">{{ $tl('sys_joblog_detail', '记录') }} </el-button>
            </template>
          </table-column>
        </template>
      </base-table>
      <pagination :total="total" :page="queryParams.PageIndex" :limit="queryParams.PageRows" @pagination="getList" />
    </div>
    <div v-if="activeName == 'log'">
      <el-row :gutter="10" class="mb8">
        <right-toolbar :showSearch="showSearch" @queryTable="getLogList"></right-toolbar>
      </el-row>
      <base-table :columns="logColumns" id="sysjoblog" :list="jobLogList" v-loading="loading" :options="{ ...options, mutiSelect: false }" :height="$table.FullViewHeight(200)"> </base-table>
      <pagination :total="logTotal" :page="logQueryParams.PageIndex" :limit="logQueryParams.PageRows" @pagination="getLogList" />
    </div>
    <!-- 添加或修改定时任务对话框 -->
    <el-dialog :title="title" :visible="open" width="700px" append-to-body v-dialogDrag>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item :label="$tl('sys_job_JobKey', '任务key')" prop="JobKey">
              <el-input v-model="form.JobKey" :placeholder="$t('MOM_InputPlease')" size="small" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$tl('sys_job_JobName', '任务名称')" prop="JobName">
              <el-input v-model="form.JobName" :placeholder="$t('MOM_InputPlease')" size="small" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$tl('sys_job_TypeFullName', '类型全名称')" prop="TypeFullName">
              <el-select v-model="form.TypeFullName" clearable @focus="getTaskType" :placeholder="$t('usual_choose')" size="small" style="width: 100%">
                <el-option v-for="dict in TypeFullNameOptions" :key="dict" :label="dict" :value="dict"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <!-- <el-col :span="24">
            <el-form-item prop="invokeTarget">
              <span slot="label">
                调用方法
                <el-tooltip placement="top">
                  <div slot="content">
                    Bean调用示例：ryTask.ryParams('ry')
                    <br />Class类调用示例：com.ruoyi.quartz.task.RyTask.ryParams('ry')
                    <br />参数说明：支持字符串，布尔类型，长整型，浮点型，整型
                  </div>
                  <i class="el-icon-question"></i>
                </el-tooltip>
              </span>
              <el-input v-model="form.invokeTarget" :placeholder="$t('MOM_InputPlease')" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('sc_cronExpression')" prop="cronExpression">
              <el-input v-model="form.cronExpression" :placeholder="$t('MOM_InputPlease')" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('sc_concurrent')" prop="concurrent">
              <el-radio-group v-model="form.concurrent" size="small">
                <el-radio-button label="0">{{$t('sc_concurrent_enable')}}</el-radio-button>
                <el-radio-button label="1">{{$t('sc_concurrent_disable')}}</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col> -->
          <el-col :span="12">
            <el-form-item :label="$tl('sys_job_ScheduleType', '计划类型')" prop="ScheduleType">
              <span slot="label">
                <el-tooltip placement="top">
                  <div slot="content">
                    MinInr：以分钟为间隔，循环执行，如设置20分钟，即每20分钟执行一次；<br />
                    HourInr：以小时为间隔，循环执行，如设置1小时，即每1小时执行一次；<br />
                    Day：以天为间隔，循环执行，设置小时（必填），可选填分钟和秒，如设置18点，30，即每天18:30执行一次；<br />
                    其他类型：cron表达式必填
                  </div>
                  <i class="el-icon-question"></i>
                </el-tooltip>
                {{ $tl('sys_job_ScheduleType', '计划类型') }}
              </span>
              <el-select v-model="form.ScheduleType" clearable @focus="getScheduleType" @change="scheduleTypeChange" :placeholder="$t('usual_choose')" size="small" style="width: 100%">
                <el-option v-for="dict in ScheduleTypeOptions" :key="dict" :label="dict" :value="dict"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$tl('usual_JobStatus', '任务状态')" prop="JobStatus">
              <el-radio-group v-model="form.JobStatus" size="small" :disabled="!form.Id">
                <el-radio-button label="Running">{{ $tl('system_on', '启动') }}</el-radio-button>
                <el-radio-button label="Pause">{{ $tl('system_pause', '暂停') }}</el-radio-button>
                <el-radio-button label="Stop">{{ $tl('system_stop', '停止') }}</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$tl('sys_Description', '描述')" prop="JobDescription">
              <el-input v-model.trim="form.JobDescription" clearable autocomplete="off" size="small" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-row>
              <el-col :span="8">
                <el-form-item :label="$tl('sys_job_Hour', '小时')" prop="Hour">
                  <el-input-number
                    :controls="false"
                    :min="1"
                    :max="23"
                    v-model="form.Hour"
                    :disabled="form.ScheduleType == 'MinInr' || this.rules.Cron[0].required"
                    style="width: 100px"
                    :precision="0"
                    size="small"
                  ></el-input-number>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item :label="$tl('sys_job_Minute', '分钟')" prop="Minute">
                  <el-input-number
                    :controls="false"
                    :min="1"
                    :max="59"
                    v-model="form.Minute"
                    :disabled="form.ScheduleType == 'HourInr' || this.rules.Cron[0].required"
                    style="width: 100px"
                    :precision="0"
                    size="small"
                  ></el-input-number>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item :label="$tl('sys_job_Second', '秒数')" prop="Second">
                  <el-input-number
                    :controls="false"
                    :min="1"
                    :max="59"
                    v-model="form.Second"
                    :disabled="form.ScheduleType == 'HourInr' || form.ScheduleType == 'MinInr' || this.rules.Cron[0].required"
                    style="width: 100px"
                    :precision="0"
                    size="small"
                  ></el-input-number>
                </el-form-item>
              </el-col>
            </el-row>
          </el-col>
          <el-col :span="24">
            <el-form-item :label="$tl('sys_job_Cron', 'cron表达式')" prop="Cron">
              <el-input v-model.trim="form.Cron" :disabled="!this.rules.Cron[0].required" clearable autocomplete="off" size="small" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm" size="small">{{ $t('usual_confirm') }}</el-button>
        <el-button @click="cancel" size="small">{{ $t('usual_cancel') }}</el-button>
      </div>
    </el-dialog>

    <!-- 任务日志详细 -->
    <!-- <el-dialog :title="$t('sc_title')" :visible.sync="openView" width="700px" append-to-body>
      <el-form ref="form" :model="form" label-width="120px" size="mini">
        <el-row>
          <el-col :span="12">
            <el-form-item :label="$t('sc_jobId')">{{ form.jobId }}</el-form-item>
            <el-form-item :label="$t('sc_JobName')">{{ form.JobName }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('sc_TypeFullName')">{{ TypeFullNameFormat(form) }}</el-form-item>
            <el-form-item :label="$t('usual_create_time')">{{ form.createTime }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('sc_cronExpression')">{{ form.cronExpression }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('sc_nextValidTime')">{{ parseTime(form.nextValidTime) }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item :label="$t('sc_invokeTarget')">{{ form.invokeTarget }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('usual_status')">
              <div v-if="form.status == 0">{{$t('system_normal')}}</div>
              <div v-else-if="form.status == 1">{{$t('sc_SB')}}</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('sc_concurrent')">
              <div v-if="form.concurrent == 0">{{$t('sc_concurrent_enable')}}</div>
              <div v-else-if="form.concurrent == 1">{{$t('sc_concurrent_disable')}}</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('sc_ZXCL')">
              <div v-if="form.misfirePolicy == 0">{{$t('sc_MRCL')}}</div>
              <div v-else-if="form.misfirePolicy == 1">{{$t('sc_IE')}}</div>
              <div v-else-if="form.misfirePolicy == 2">{{$t('sc_runtime')}}</div>
              <div v-else-if="form.misfirePolicy == 3">{{$t('sc_QE')}}</div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="openView = false">{{$t('usual_close')}}</el-button>
      </div>
    </el-dialog> -->
  </div>
</template>

<script>
import {
  listJob,
  getJob,
  delJob,
  addJob,
  updateJob,
  exportJob,
  runJob,
  changeJobStatus,
  getScheduleJob,
  getJobSources,
  getScheduleType,
  saveSchedule,
  deleteSchedule,
  loadSchedule,
  runSchedule,
  startSchedule,
  pauseSchedule,
  resumeSchedule,
  stopSchedule,
  getScheduleJobList,
  getExcuteLog,
  getExcuteLogByKey,
} from '@/api/monitor/job'
import RequestService from '@/components/RequestService'

export default {
  name: 'Job',
  components: {
    RequestService,
  },
  data() {
    return {
      // 遮罩层
      loading: false,
      // 导出遮罩层
      exportLoading: false,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      logTotal: 0,
      // 定时任务表格数据
      jobList: [],
      jobLogList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 是否显示详细弹出层
      openView: false,
      // 任务组名字典
      TypeFullNameOptions: [],
      // 状态字典
      statusOptions: [],
      ScheduleTypeOptions: [],
      rowRecord: [],
      activeName: 'list',
      // 查询参数
      queryParams: {
        PageIndex: 1,
        PageRows: 100,
        Search: {
          jobStatus: undefined,
          jobKey: undefined,
        },
      },
      logQueryParams: {
        PageIndex: 1,
        PageRows: 100,
        Search: {
          jobStatus: undefined,
          jobKey: undefined,
        },
      },
      // 表单参数
      form: {
        Id: '',
        JobKey: '',
        JobName: '',
        Cron: '',
        JobDescription: '',
        ScheduleType: undefined,
        TypeFullName: undefined,
        Second: undefined,
        Minute: undefined,
        Hour: undefined,
        JobStatus: 'Stop',
      },
      // 表单校验
      rules: {
        JobName: [{ required: true, message: this.$t('MOM_IsRequire'), trigger: 'blur' }],
        JobKey: [{ required: true, message: this.$t('MOM_IsRequire'), trigger: 'blur' }],
        TypeFullName: [{ required: true, message: this.$t('MOM_IsRequire'), trigger: 'blur' }],
        Hour: [{ required: false, message: this.$t('MOM_IsRequire'), trigger: 'blur' }],
        Minute: [{ required: false, message: this.$t('MOM_IsRequire'), trigger: 'blur' }],
        Cron: [{ required: true, message: this.$t('MOM_IsRequire'), trigger: 'blur' }],
      },
      options: {
        showNum: true, // 是否显示序号
        stripe: false, // 是否为斑马纹 table
        highlightCurrentRow: false, // 是否支持当前行高亮显示
        mutiSelect: true, // 是否支持列表项选中功能
      }, // table 的参数
      logColumns: [
        { title: this.$tl('sys_job_JobKey', '任务key'), dataIndex: 'JobKey', width: '160px', fixed: 'left', ellipsis: true, align: 'left' },
        { title: this.$tl('sys_job_JobName', '任务名称'), dataIndex: 'JobName', width: '200px', ellipsis: true, align: 'left' },
        { title: this.$tl('sys_job_TypeFullName', '类型全名称'), dataIndex: 'TypeFullName', width: '200px', ellipsis: true, align: 'left' },
        { title: this.$tl('sys_job_Status', '执行状态'), dataIndex: 'Status', width: '80px', ellipsis: true, align: 'left' },
        { title: this.$tl('sys_joblog_CreateTime', '开始时间'), dataIndex: 'CreateTime', width: '80px', ellipsis: true, align: 'left' },
        { title: this.$tl('sys_job_ExcuteTime', '结束时间'), dataIndex: 'ExcuteTime', width: '80px', ellipsis: true, align: 'left' },
      ],
      columns: [
        { title: this.$tl('sys_job_JobKey', '任务key'), dataIndex: 'JobKey', width: '130px', fixed: 'left', ellipsis: true, align: 'left' },
        { title: this.$tl('sys_job_JobName', '任务名称'), dataIndex: 'JobName', width: '180px', ellipsis: true, align: 'left' },
        { title: this.$tl('sys_job_TypeFullName', '类型全名称'), dataIndex: 'TypeFullName', width: '180px', ellipsis: true, align: 'left' },
        { title: this.$tl('sys_job_JobStatus', '任务状态'), dataIndex: 'JobStatus', width: '130px', ellipsis: true, align: 'left' },
        { title: this.$tl('sys_job_ScheduleType', '计划类型'), dataIndex: 'ScheduleType', width: '130px', ellipsis: true, align: 'left' },
        { title: this.$tl('sys_job_JobDescription', '任务描述'), dataIndex: 'JobDescription', width: '130px', ellipsis: true, align: 'left' },
        { title: this.$tl('sys_job_Cron', 'cron表达式'), dataIndex: 'Cron', width: '160px', ellipsis: true, align: 'left' },
        { title: this.$tl('sys_job_Hour', '小时'), dataIndex: 'Hour', width: '130px', ellipsis: true, align: 'left' },
        { title: this.$tl('sys_job_Minute', '分钟'), dataIndex: 'Minute', width: '130px', ellipsis: true, align: 'left' },
        { title: this.$tl('sys_job_Second', '秒数'), dataIndex: 'Second', width: '130px', ellipsis: true, align: 'left' },
        { title: this.$tl('sys_job_StartTime', '开始时间'), dataIndex: 'StartTime', width: '130px', ellipsis: true, align: 'left' },
        { title: this.$tl('sys_job_EndTime', '结束时间'), dataIndex: 'EndTime', width: '130px', ellipsis: true, align: 'left' },
        { title: this.$tl('sys_job_FinalFireTime', '最后一次执行时间'), dataIndex: 'FinalFireTime', width: '130px', ellipsis: true, align: 'left' },
        { title: this.$tl('sys_job_NextExecuteTime', '下次执行时间'), dataIndex: 'NextExecuteTime', width: '130px', ellipsis: true, align: 'left' },
        { title: this.$t('MMS_Remark'), dataIndex: 'Remark' },
        { title: this.$t('usual_create_time'), dataIndex: 'CreateTime', width: '180px' },
        { title: this.$t('usual_creation'), dataIndex: 'CreatorId', width: '120px' },
        { title: this.$t('usual_creation_name'), dataIndex: 'CreatorName', width: '100px' },
        { title: this.$t('usual_update_time'), dataIndex: 'UpdateTime', width: '160px' },
        { title: this.$t('usual_updator'), dataIndex: 'UpdaterId', width: '120px' },
        { title: this.$t('usual_update_name'), dataIndex: 'UpdaterName', width: '100px' },
      ],
    }
  },
  created() {
    this.getList()
    // this.getTaskType();
    // this.getDicts("sys_job_group").then(response => {
    //   this.TypeFullNameOptions = response.data;
    // });
    this.getDicts('sys_job_status').then(response => {
      this.statusOptions = response.data
    })
  },
  methods: {
    /** 查询定时任务列表 */
    async getList() {
      if (!this.queryParams.Service) {
        this.jobList = []
        this.total = 0
      } else {
        this.loading = true
        this.options.loading = true
        const res = await getScheduleJob(this.queryParams)
        this.loading = false
        this.options.loading = false
        this.jobList = []
        if (res.Success) {
          this.jobList = res.Data.PageList || []
          this.total = res.Data.Total || 0
        } else {
          this.msgError(res.Msg)
        }
      }
    },
    /** 查询定时任务执行列表 */
    async getLogList() {
      if (!this.queryParams.Service) {
        this.jobLogList = []
        this.total = 0
      } else {
        this.loading = true
        this.options.loading = true
        const data = JSON.parse(JSON.stringify(this.logQueryParams))
        data.Service = this.queryParams.Service
        data.Search = this.queryParams.Search
        const res = await getExcuteLog(data)
        this.loading = false
        this.options.loading = false
        this.jobLogList = []
        if (res.Success) {
          this.jobLogList = res.Data.PageList || []
          this.logTotal = res.Data.Total || 0
        } else {
          this.msgError(res.Msg)
        }
      }
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        Id: '',
        JobKey: '',
        JobName: '',
        Cron: '',
        JobDescription: '',
        ScheduleType: undefined,
        TypeFullName: undefined,
        Second: undefined,
        Minute: undefined,
        Hour: undefined,
        JobStatus: 'Stop',
      }
      this.resetForm('form')
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.$refs.queryForm.validate(async valid => {
        if (valid) {
          this.queryParams.PageIndex = 1
          this.logQueryParams.PageIndex = 1
          this.getList()
          this.getLogList()
        }
      })
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = this.$t('usual_add')
    },
    /** 修改按钮操作 */
    handleUpdate() {
      this.reset()
      this.form = JSON.parse(JSON.stringify(this.rowRecord[0]))
      this.form.Hour = this.rowRecord[0].Hour ? this.rowRecord[0].Hour : undefined
      this.form.Minute = this.rowRecord[0].Minute ? this.rowRecord[0].Minute : undefined
      this.form.Second = this.rowRecord[0].Second ? this.rowRecord[0].Second : undefined
      if (this.form.ScheduleType) this.scheduleTypeChange(this.rowRecord[0].ScheduleType)
      this.open = true
      this.title = this.$t('usual_update')
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs['form'].validate(async valid => {
        if (valid) {
          const data = { ...this.form, ...{ Service: this.queryParams.Service } }
          const res = await saveSchedule(data)
          if (res.Success) {
            this.msgSuccess(this.$tl('usual_operation_success', '操作成功'))
            this.getList()
            this.$refs.form.resetFields()
            this.form.id = ''
            this.open = false
          } else {
            this.msgError(res.Msg)
          }
        }
      })
    },
    /** 删除按钮操作 */
    async handleDelete() {
      const data = this.rowRecord.map(item => item.Id)
      const res = await deleteSchedule({ Service: this.queryParams.Service, data })
      if (res.Success) {
        this.msgSuccess(res.Data || this.$tl('IQC_DeleteSuccess'))
        this.getList()
      } else {
        this.msgError(res.Msg)
      }
    },
    // 获取任务源
    async getTaskType() {
      const res = await getJobSources({ Service: this.queryParams.Service })
      if (res.Success) {
        this.TypeFullNameOptions = res.Data || []
      } else {
        this.msgError(res.Msg)
      }
    },
    // 获取任务类型
    async getScheduleType() {
      const res = await getScheduleType({ Service: this.queryParams.Service })
      if (res.Success) {
        this.ScheduleTypeOptions = res.Data || []
      } else {
        this.msgError(res.Msg)
      }
    },
    onSelectChange(selection) {
      this.rowRecord = selection
    },
    async handleStart(row) {
      const data = { Service: this.queryParams.Service, key: row.JobKey }
      const res = await startSchedule(data)
      if (res.Success) {
        this.msgSuccess(this.$tl('usual_operation_success', '操作成功'))
        this.getList()
      } else {
        this.msgError(res.Msg)
      }
    },
    async handlePause(row) {
      const data = { Service: this.queryParams.Service, key: row.JobKey }
      const res = await pauseSchedule(data)
      if (res.Success) {
        this.msgSuccess(this.$tl('usual_operation_success', '操作成功'))
        this.getList()
      } else {
        this.msgError(res.Msg)
      }
    },
    async handleResume(row) {
      const data = { Service: this.queryParams.Service, key: row.JobKey }
      const res = await resumeSchedule(data)
      if (res.Success) {
        this.msgSuccess(this.$tl('usual_operation_success', '操作成功'))
        this.getList()
      } else {
        this.msgError(res.Msg)
      }
    },
    async handleStop(row) {
      const data = { Service: this.queryParams.Service, key: row.JobKey }
      const res = await stopSchedule(data)
      if (res.Success) {
        this.msgSuccess(this.$tl('usual_operation_success', '操作成功'))
        this.getList()
      } else {
        this.msgError(res.Msg)
      }
    },
    async handleDetail(row) {
      this.queryParams.Search.jobKey = row.JobKey
      this.getLogList()
      this.activeName = 'log'
    },
    async handleRun() {
      const row = this.rowRecord[0] || {}
      const data = { Service: this.queryParams.Service, key: row.JobKey }
      const res = await runSchedule(data)
      if (res.Success) {
        this.msgSuccess(this.$tl('usual_operation_success', '操作成功'))
        this.getList()
      } else {
        this.msgError(res.Msg)
      }
    },
    async handleLoad() {
      const data = { Service: this.queryParams.Service, data: [] }
      const res = await loadSchedule(data)
      if (res.Success) {
        this.msgSuccess(res.Data || this.$tl('usual_operation_success'))
        this.getList()
      } else {
        this.msgError(res.Msg)
      }
    },
    scheduleTypeChange(value) {
      const type = value.toUpperCase()
      switch (type) {
        case '':
          this.$set(this.rules.Hour[0], 'required', false)
          this.$set(this.rules.Minute[0], 'required', false)
          this.$set(this.rules.Cron[0], 'required', true)
          break
        case 'DAY':
          this.form.Cron = ''
          this.$set(this.rules.Hour[0], 'required', true)
          this.$set(this.rules.Minute[0], 'required', false)
          this.$set(this.rules.Cron[0], 'required', false)
          break
        case 'HOURINR':
          this.form.Cron = ''
          this.form.Minute = undefined
          this.form.Second = undefined
          this.$set(this.rules.Hour[0], 'required', true)
          this.$set(this.rules.Minute[0], 'required', false)
          this.$set(this.rules.Cron[0], 'required', false)
          break
        case 'MININR':
          this.form.Cron = ''
          this.form.Hour = undefined
          this.form.Second = undefined
          this.$set(this.rules.Hour[0], 'required', false)
          this.$set(this.rules.Minute[0], 'required', true)
          this.$set(this.rules.Cron[0], 'required', false)
          break

        default:
          this.$set(this.rules.Hour[0], 'required', false)
          this.$set(this.rules.Minute[0], 'required', false)
          this.$set(this.rules.Cron[0], 'required', true)
          break
      }
    },
    serviceChange(value) {
      if (value) {
        this.handleQuery()
      } else {
        this.jobList = []
        this.total = 0
      }
    },
  },
}
</script>
