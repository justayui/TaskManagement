package com.taskmanagement.backend.service;

import com.taskmanagement.backend.dto.TaskListResponse;
import com.taskmanagement.backend.repository.TaskListRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class TaskListService {

    private final TaskListRepository taskListRepository;

    public TaskListService(TaskListRepository taskListRepository) {
        this.taskListRepository = taskListRepository;
    }

    public List<TaskListResponse> getListsByBoardId(UUID boardId) {
        return taskListRepository.findByBoardIdOrderByOrderAsc(boardId).stream()
                .map(TaskListResponse::from)
                .toList();
    }
}
