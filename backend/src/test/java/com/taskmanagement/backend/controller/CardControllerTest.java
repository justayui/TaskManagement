package com.taskmanagement.backend.controller;

import com.taskmanagement.backend.dto.CardResponse;
import com.taskmanagement.backend.dto.UpdateCardRequest;
import com.taskmanagement.backend.entity.Priority;
import com.taskmanagement.backend.service.CardService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import tools.jackson.databind.ObjectMapper;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CardController.class)
class CardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private CardService cardService;

    @Test
    void updateCard_returnsOkAndUpdatedCard() throws Exception {
        UUID cardId = UUID.randomUUID();
        UUID listId = UUID.randomUUID();
        UpdateCardRequest request = new UpdateCardRequest(
                "新しいタイトル", "新しい説明", Priority.HIGH, LocalDate.of(2026, 3, 1));
        CardResponse response = new CardResponse(
                cardId, listId, "新しいタイトル", "新しい説明", 0, Priority.HIGH,
                LocalDate.of(2026, 3, 1), LocalDateTime.now(), LocalDateTime.now());

        when(cardService.updateCard(eq(cardId), any(UpdateCardRequest.class))).thenReturn(response);

        mockMvc.perform(patch("/api/cards/{id}", cardId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("新しいタイトル"))
                .andExpect(jsonPath("$.description").value("新しい説明"))
                .andExpect(jsonPath("$.priority").value("HIGH"))
                .andExpect(jsonPath("$.dueDate").value("2026-03-01"));

        verify(cardService).updateCard(eq(cardId), any(UpdateCardRequest.class));
    }

    @Test
    void updateCard_returnsNotFound_whenCardDoesNotExist() throws Exception {
        UUID cardId = UUID.randomUUID();
        UpdateCardRequest request = new UpdateCardRequest("タイトル", null, null, null);

        when(cardService.updateCard(eq(cardId), any(UpdateCardRequest.class)))
                .thenThrow(new ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Card not found: " + cardId));

        mockMvc.perform(patch("/api/cards/{id}", cardId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }
}
