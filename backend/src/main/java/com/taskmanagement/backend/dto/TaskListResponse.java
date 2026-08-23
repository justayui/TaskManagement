package com.taskmanagement.backend.dto;

import com.taskmanagement.backend.entity.TaskList;

import java.time.LocalDateTime;
import java.util.UUID;

public record TaskListResponse(
        UUID id,
        UUID boardId,
        String name,
        int order,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {

    public static TaskListResponse from(TaskList taskList) {
        return new TaskListResponse(
                taskList.getId(),
                taskList.getBoard().getId(),
                taskList.getName(),
                taskList.getOrder(),
                taskList.getCreatedAt(),
                taskList.getUpdatedAt()
        );
    }
}
